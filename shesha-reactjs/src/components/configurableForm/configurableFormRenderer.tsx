import _ from 'lodash';
import axios, { AxiosResponse } from 'axios';
import classNames from 'classnames';
import cleanDeep from 'clean-deep';
import ComponentsContainer from '../formDesigner/containers/componentsContainer';
import moment from 'moment';
import qs from 'qs';
import React, {
  FC,
  PropsWithChildren,
  useEffect,
  useMemo,
  useState
  } from 'react';
import {
  addFormFieldsList,
  hasFiles,
  jsonToFormData,
  removeGhostKeys
  } from '@/utils/form';
import { axiosHttp } from '@/utils/fetchers';
import { ComponentsContainerForm } from '../formDesigner/containers/componentsContainerForm';
import { ComponentsContainerProvider } from '@/providers/form/nesting/containerContext';
import { Form, message, Spin } from 'antd';
import { filterDataByOutputComponents, FormConfigurationDto, useFormData } from '@/providers/form/api';
import { getQueryParams } from '@/utils/url';
import { IAbpWrappedGetEntityResponse } from '@/interfaces/gql';
import { IAnyObject, ValidateErrorEntity } from '@/interfaces';
import { IConfigurableFormRendererProps, IDataSourceComponent } from './models';
import { nanoid } from '@/utils/uuid';
import { ROOT_COMPONENT_KEY } from '@/providers/form/models';
import { StandardEntityActions } from '@/interfaces/metadata';
import { useDataContextManager } from '@/providers/dataContextManager/index';
import { useDelayedUpdate } from '@/providers/delayedUpdateProvider';
import { useForm } from '@/providers/form';
import { useFormDesigner } from '@/providers/formDesigner';
import { useGlobalState, useSheshaApplication } from '@/providers';
import { useModelApiEndpoint } from './useActionEndpoint';
import { useMutate } from '@/hooks/useMutate';
import { useStyles } from './styles/styles';
import {
  evaluateComplexString,
  evaluateKeyValuesToObjectMatchedData,
  evaluateString,
  evaluateValue,
  getComponentNames,
  getObjectWithOnlyIncludedKeys,
  IMatchData,
} from '@/providers/form/utils';
import { useFormDesignerComponents } from '@/providers/form/hooks';
import { SheshaCommonContexts } from '@/providers/dataContextManager/models';

export const ConfigurableFormRenderer: FC<PropsWithChildren<IConfigurableFormRendererProps>> = ({
  children,
  form,
  submitAction = StandardEntityActions.create,
  parentFormValues,
  initialValues,
  beforeSubmit,
  prepareInitialValues,
  skipFetchData,
  ...props
}) => {

  const formInstance = useForm();
  const { styles } = useStyles();
  //const contextManager = useDataContextManager(false);
  //if (contextManager)
  //  contextManager.updateFormInstance(formInstance);

  const {
    updateStateFormData,
    formData,
    allComponents,
    formMode,
    formSettings,
    formMarkup,
    setValidationErrors,
    setFormData,
    visibleComponentIdsIsSet,
  } = formInstance;

  const designerMode = formMode === 'designer';

  const { isDragging = false } = useFormDesigner(false) ?? {};
  const toolboxComponents = useFormDesignerComponents();
  

  const { excludeFormFieldsInPayload, onDataLoaded, onUpdate, onInitialized, formKeysToPersist, uniqueFormId } =
    formSettings;
  const { globalState, setState: setGlobalState } = useGlobalState();
  const dcm = useDataContextManager(false);

  const urlEvaluationData: IMatchData[] = [
    { match: 'initialValues', data: initialValues },
    { match: 'query', data: getQueryParams() },
    { match: 'data', data: formData },
    { match: 'parentFormValues', data: parentFormValues },
    { match: 'globalState', data: globalState },
  ];

  const submitEndpoint = useModelApiEndpoint({
    actionName: submitAction,
    formSettings: formSettings,
    mappings: urlEvaluationData,
  });

  const { backendUrl, httpHeaders } = useSheshaApplication();
  const [lastTruthyPersistedValue, setLastTruthyPersistedValue] = useState<IAnyObject>(null);

  const dataFetcher = useFormData({
    formMarkup: formMarkup,
    formSettings: formSettings,
    lazy: skipFetchData,
    urlEvaluationData: urlEvaluationData,
    // data: formData, NOTE: form data must not be used here!
  });

  const { getPayload: getDelayedUpdate } = useDelayedUpdate(false) ?? {};

  const queryParamsFromAddressBar = useMemo(() => getQueryParams(), []);

  const sheshaUtils = {
    prepareTemplate: (templateId: string, replacements: object): Promise<string> => {
      if (!templateId) return Promise.resolve(null);

      const payload = {
        id: templateId,
        properties: 'markup',
      };
      const url = `${backendUrl}/api/services/Shesha/FormConfiguration/Query?${qs.stringify(payload)}`;
      return axios
        .get<any, AxiosResponse<IAbpWrappedGetEntityResponse<FormConfigurationDto>>>(url, { headers: httpHeaders })
        .then((response) => {
          const markup = response.data.result.markup;

          const preparedMarkup = evaluateString(markup, {
            NEW_KEY: nanoid(),
            GEN_KEY: nanoid(),
            ...(replacements ?? {}),
          });

          return preparedMarkup;
        });
    },
  };

  const executeExpression = (
    expression: string,
    includeInitialValues = true,
    includeMoment = true,
    includeAxios = true,
    includeMessage = true,
    exposedData = null
  ) => {
    if (!expression) {
      return null;
    }

    const application = dcm?.getDataContext(SheshaCommonContexts.ApplicationContext);

    // tslint:disable-next-line:function-constructor
    return new Function(
      'data, parentFormValues, initialValues, globalState, moment, http, message, shesha, form, setFormData, setGlobalState, contexts, application',
      expression
    )(
      exposedData || formData,
      parentFormValues,
      includeInitialValues ? initialValues : undefined,
      globalState,
      includeMoment ? moment : undefined,
      includeAxios ? axiosHttp(backendUrl) : undefined,
      includeMessage ? message : undefined,
      sheshaUtils,
      form,
      setFormData,
      setGlobalState,
      { ...dcm?.getDataContextsData(), lastUpdate: dcm?.lastUpdate },
      application?.getData(),
    );
  };


  // Execute onInitialized if provided
  useEffect(() => {
    if (onInitialized) {
      try {
        executeExpression(onInitialized);
      } catch (error) {
        console.warn('onInitialized error', error);
      }
    }
  }, [onInitialized]);

  //#region PERSISTED FORM VALUES
  // I decided to do the persisting manually since the hook way fails in prod. Only works perfectly, but on Storybook
  // TODO: Revisit this
  useEffect(() => {
    if (window && uniqueFormId) {
      const itemFromStorage = window?.localStorage?.getItem(uniqueFormId);
      setLastTruthyPersistedValue(_.isEmpty(itemFromStorage) ? null : JSON.parse(itemFromStorage));
    }
  }, [uniqueFormId]);

  useEffect(() => {
    if (uniqueFormId && formKeysToPersist?.length && !_.isEmpty(formData)) {
      localStorage.setItem(uniqueFormId, JSON.stringify(getObjectWithOnlyIncludedKeys(formData, formKeysToPersist)));
    } else {
      localStorage.removeItem(uniqueFormId);
    }
  }, [formData]);
  //#endregion

  const onValuesChangeInternal = (changedValues: any, values: any) => {
    if (props.onValuesChange) props.onValuesChange(changedValues, values);

    // recalculate components visibility
    updateStateFormData({ values, mergeValues: true });
  };

  const initialValuesFromSettings = useMemo(() => {
    const computedInitialValues = {} as object;

    formSettings?.initialValues?.forEach(({ key, value }) => {
      const evaluatedValue = value?.includes('{{')
        ? evaluateComplexString(value, [
          { match: 'data', data: formData },
          { match: 'parentFormValues', data: parentFormValues },
          { match: 'globalState', data: globalState },
          { match: 'query', data: queryParamsFromAddressBar },
          { match: 'initialValues', data: initialValues },
        ])
        : value?.includes('{')
          ? evaluateValue(value, {
            data: formData,
            parentFormValues: parentFormValues,
            globalState: globalState,
            query: queryParamsFromAddressBar,
            initialValues: initialValues,
          })
          : value;
      _.set(computedInitialValues, key, evaluatedValue);
    });

    return computedInitialValues;
  }, [formSettings?.initialValues]);

  const fetchedFormEntity = dataFetcher.fetchedData as object;

  useEffect(() => {
    if (fetchedFormEntity && onDataLoaded) {
      executeExpression(onDataLoaded, true, true, true, true, fetchedFormEntity); // On Initialize
    }
  }, [onDataLoaded, fetchedFormEntity]);

  useEffect(() => {
    if (onUpdate) {
      executeExpression(onUpdate); // On Update
    }
  }, [formData, onUpdate]);

  // reset form to initial data on any change of components or initialData
  // only if data is not fetched or form is not in designer mode
  useEffect(() => {
    if (!fetchedFormEntity && !designerMode)
      setFormData({ values: initialValues, mergeValues: false });
  }, [allComponents, initialValues]);

  useEffect(() => {
    let incomingInitialValues = null;

    // By default the `initialValuesFromSettings` are merged with `fetchedFormEntity`
    // If you want only `initialValuesFromSettings`, then pass skipFetchData
    // If you want only `fetchedFormEntity`, don't pass `initialValuesFromSettings`
    if (!_.isEmpty(initialValuesFromSettings)) {
      incomingInitialValues = fetchedFormEntity
        ? Object.assign(fetchedFormEntity, initialValuesFromSettings)
        : initialValuesFromSettings;
    } else if (!_.isEmpty(fetchedFormEntity) || !_.isEmpty(lastTruthyPersistedValue)) {
      // `fetchedFormEntity` will always be merged with persisted values from local storage
      // To override this, to not persist values or pass skipFetchData
      let computedInitialValues = fetchedFormEntity
        ? prepareInitialValues
          ? prepareInitialValues(fetchedFormEntity)
          : fetchedFormEntity
        : initialValues;

      if (!_.isEmpty(lastTruthyPersistedValue)) {
        computedInitialValues = { ...computedInitialValues, ...lastTruthyPersistedValue };
      }
      incomingInitialValues = computedInitialValues;
    }
    // }

    if (incomingInitialValues) {
      setFormData({ values: incomingInitialValues, mergeValues: true });
    }
  }, [fetchedFormEntity, lastTruthyPersistedValue, initialValuesFromSettings, uniqueFormId]);

  const { mutate: doSubmit, loading: submitting } = useMutate();

  const getDynamicPreparedValues = (): Promise<object> => {
    const { preparedValues } = formSettings;

    return Promise.resolve(preparedValues ? executeExpression(preparedValues) : {});
  };

  const getInitialValuesFromFormSettings = () => {
    const initialValuesFromFormSettings = formSettings?.initialValues;

    const values = evaluateKeyValuesToObjectMatchedData(initialValuesFromFormSettings, [
      { match: 'data', data: formData },
      { match: 'parentFormValues', data: parentFormValues },
      { match: 'globalState', data: globalState },
    ]);

    return cleanDeep(values, {
      // cleanKeys: [], // Don't Remove specific keys, ie: ['foo', 'bar', ' ']
      // cleanValues: [], // Don't Remove specific values, ie: ['foo', 'bar', ' ']
      // emptyArrays: false, // Don't Remove empty arrays, ie: []
      // emptyObjects: false, // Don't Remove empty objects, ie: {}
      // emptyStrings: false, // Don't Remove empty strings, ie: ''
      // NaNValues: true, // Remove NaN values, ie: NaN
      // nullValues: true, // Remove null values, ie: null
      undefinedValues: true, // Remove undefined values, ie: undefined
    });
  };

  const options = { setValidationErrors };

  const convertToFormDataIfRequired = (data: any) => {
    return data && hasFiles(data) ? jsonToFormData(data) : data;
  };

  const prepareDataForSubmit = (): Promise<object> => {
    const initialValuesFromFormSettings = getInitialValuesFromFormSettings();

    return getDynamicPreparedValues()
      .then((dynamicValues) => {
        const initialValues = getInitialValuesFromFormSettings();
        const nonFormValues = { ...dynamicValues, ...initialValues };

        let postData = excludeFormFieldsInPayload
          ? removeGhostKeys({ ...formData, ...nonFormValues })
          : removeGhostKeys(addFormFieldsList(formData, nonFormValues, form));

        postData = filterDataByOutputComponents(postData, allComponents, toolboxComponents);

        const delayedUpdate = typeof getDelayedUpdate === 'function' ? getDelayedUpdate() : null;
        if (Boolean(delayedUpdate)) postData._delayedUpdate = delayedUpdate;

        const subFormNamesToIgnore = getComponentNames(
          allComponents,
          (component: IDataSourceComponent) =>
            (component?.type === 'list' || component?.type === 'subForm') && component.dataSource === 'api'
        );

        if (subFormNamesToIgnore?.length) {
          subFormNamesToIgnore.forEach((key) => {
            if (Object.hasOwn(postData, key)) {
              delete postData[key];
            }
          });
          const isEqualOrStartsWith = (input: string) =>
            subFormNamesToIgnore?.some((x) => x === input || input.startsWith(`${x}.`));

          postData._formFields = postData._formFields?.filter((x) => !isEqualOrStartsWith(x));
        }

        if (excludeFormFieldsInPayload) {
          delete postData._formFields;
        } else {
          if (initialValuesFromFormSettings) {
            postData._formFields = Array.from(
              new Set<string>([...(postData._formFields || []), ...Object.keys(initialValuesFromFormSettings)])
            );
          }
        }

        return postData;
      })
      .catch((error) => console.error(error));
  };

  const onFinishInternal = () => {
    prepareDataForSubmit().then((postData) => {
      if (props.onFinish) {
        props.onFinish(postData, options);
      } else {
        if (submitEndpoint?.url) {
          setValidationErrors(null);

          const preparedData = convertToFormDataIfRequired(postData);

          const doPost = () =>
            doSubmit(submitEndpoint, preparedData)
              .then((response) => {
                // note: we pass merged values
                if (props.onSubmitted) props.onSubmitted(postData, response?.result, options);
              })
              .catch((e) => {
                setValidationErrors(e?.data?.error || e);
                console.error('Submit failed: ', e);
              });

          if (typeof beforeSubmit === 'function') {
            beforeSubmit(postData)
              .then(() => {
                doPost();
              })
              .catch((e) => {
                console.error('`beforeSubmit` handler failed', e);
              });
          } else {
            doPost();
          }
        } else throw 'failed to determine a submit endpoint';
      }
    });
  };

  const onFinishFailedInternal = (errorInfo: ValidateErrorEntity) => {
    setValidationErrors(null);
    if (props.onFinishFailed) props.onFinishFailed(errorInfo);
  };

  const mergedProps = {
    layout: props.layout ?? formSettings.layout,
    labelCol: props.labelCol ?? formSettings.labelCol,
    wrapperCol: props.wrapperCol ?? formSettings.wrapperCol,
    colon: formSettings.colon,
  };

  // Note: render form only after calculation of visible components to prevent re-creation of components
  // Looks like the code that re-creates components are deep inside the antd form
  if (!visibleComponentIdsIsSet) return null;

  return (
    <Spin spinning={submitting}>
      <Form
        form={form}
        labelWrap
        size={props.size}
        onFinish={onFinishInternal}
        onFinishFailed={onFinishFailedInternal}
        onValuesChange={onValuesChangeInternal}
        initialValues={initialValues}
        className={classNames(styles.shaForm, { 'sha-dragging': isDragging }, props.className)}
        {...mergedProps}
      >
        <ComponentsContainerProvider ContainerComponent={ComponentsContainerForm}>
          <ComponentsContainer containerId={ROOT_COMPONENT_KEY}   />
        </ComponentsContainerProvider>
        {children}
      </Form>
    </Spin>
  );
};

export default ConfigurableFormRenderer;
