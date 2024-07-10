import { LoadingOutlined } from '@ant-design/icons';
import { App, Button, Form, message, Result, Spin } from 'antd';
import classNames from 'classnames';
import isDeepEqual from 'fast-deep-equal/react';
import moment from 'moment';
import { nanoid } from '@/utils/uuid';
import Link from 'next/link';
import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { ConfigurableForm, ValidationErrors } from '@/components';
import { useModelApiEndpoint } from '@/components/configurableForm/useActionEndpoint';
import { getInitialValues } from '@/components/configurableForm/useInitialValues';
import { useMutate, usePrevious, usePubSub } from '@/hooks';
import { PageWithLayout } from '@/interfaces';
import { IErrorInfo } from '@/interfaces/errorInfo';
import { StandardEntityActions } from '@/interfaces/metadata';
import {
  MetadataProvider,
  useAppConfigurator,
  useGlobalState,
  useShaRouting,
  useSheshaApplication,
} from '@/providers';
import { useFormWithData } from '@/providers/form/api';
import { ConfigurableFormInstance, ISetFormDataPayload } from '@/providers/form/contexts';
import { DEFAULT_FORM_SETTINGS } from '@/providers/form/models';
import { axiosHttp } from '@/utils/fetchers';
import { getQueryParams } from '@/utils/url';
import { IDynamicPageProps, IDynamicPageState, INavigationState } from './interfaces';
import StackedNavigationModal from './navigation/stackedNavigationModal';
import { useStackedModal } from './navigation/stackedNavigationModalProvider';
import { useStackedNavigation } from './navigation/stakedNavigation';
import { DynamicFormPubSubConstants } from './pubSub';
import { useDataContextManager } from '@/providers/dataContextManager/index';
import { DataContextProvider } from '@/providers/dataContextProvider';
import { SheshaCommonContexts } from '@/providers/dataContextManager/models';
import { executeScript } from '@/providers/form/utils';
import { getFormApi } from '@/providers/form/formApi';
import { getFormForbiddenMessage } from '@/providers/configurationItemsLoader/utils';

const DynamicPageInternal: PageWithLayout<IDynamicPageProps> = (props) => {
  const { backendUrl } = useSheshaApplication();
  const [state, setState] = useState<IDynamicPageState>({});
  const formRef = useRef<ConfigurableFormInstance>();
  const { globalState, setState: setGlobalState } = useGlobalState();
  const { router } = useShaRouting();
  const { configurationItemMode } = useAppConfigurator();
  const dcm = useDataContextManager(false);
  const pageContext = dcm.getPageContext();
  const app = App.useApp();

  const { publish } = usePubSub();

  const { id, formId } = state;

  const formWithData = useFormWithData({ formId: formId, dataId: id, configurationItemMode: configurationItemMode });
  
  const formSettings = useMemo(() =>
     formWithData.loadingState === 'ready' ? formWithData.form?.settings ?? DEFAULT_FORM_SETTINGS : null
  , [formWithData.loadingState]);

  const [form] = Form.useForm();

  const submitAction = useMemo(() => {
    return id || Boolean(formWithData.fetchedData) ? StandardEntityActions.update : StandardEntityActions.create;
  }, [id, formWithData.fetchedData]);

  const submitEndpoint = useModelApiEndpoint({
    actionName: submitAction,
    formSettings: formSettings,
    mappings: [
      { match: 'query', data: getQueryParams() },
      { match: 'globalState', data: globalState },
    ],
  });

  const { mutate: postData, loading: isPostingData } = useMutate();

  //#region routing
  const { setCurrentNavigator, navigator } = useStackedNavigation();
  const [navigationState, setNavigationState] = useState<INavigationState>();
  const { parentId } = useStackedModal(); // If the parentId is null, we're in the root page
  const closing = useRef(false);

  useEffect(() => {
    const stackId = nanoid();

    if (props?.navMode === 'stacked' || navigationState) {
      const isInitialized = state?.formId;

      if (!isInitialized) {
        setState({ ...props, stackId });
        setCurrentNavigator(stackId);
      } else if (navigationState && navigationState?.closing) {
        setNavigationState(null); // We're closing the dialog
      }
    } else {
      setState({ ...props, stackId });
      setCurrentNavigator(stackId);
    }
  }, [props]);

  const previousProps = usePrevious(props);
  const previousRouter = usePrevious(router?.query);

  useEffect(() => {
    if (!router?.query?.navMode && !navigationState) {
      return;
    } else if (!parentId && !router?.query?.navMode) {
      setNavigationState(null);
      setCurrentNavigator(state?.stackId);

      setState((prev) => ({ ...prev, ...router?.query }));
      closing.current = false;
      return;
    }

    if (
      navigator &&
      state?.stackId === navigator &&
      !navigationState &&
      !closing?.current &&
      !isDeepEqual(previousProps, router?.query) &&
      !isDeepEqual(previousRouter, router?.query)
    ) {
      const fullPath =
        props && Array.isArray(props.path)
          ? props.path.length === 1
            ? [null, props.path[0]]
            : props.path.length === 2
            ? [props.path[0], props.path[1]]
            : [null, null]
          : [null, null];

      setNavigationState({
        ...router?.query,
        formId: {
          module: fullPath[0],
          name: fullPath[1],
        },
      });
      closing.current = false;
    }
    closing.current = false;
  }, [router]);

  useEffect(() => {
    if (navigationState?.closing) {
      router?.back();
    }
  }, [navigationState?.closing]);

  const onStackedDialogClose = () => {
    closing.current = true;

    setNavigationState((prev) => ({ ...prev, closing: true }));
    setCurrentNavigator(state?.stackId);
  };

  const hasDialog = Boolean(props?.onCloseDialog);
  //#endregion

  //#region get form data

  const onChangeId = (localId: string) => {
    setState((prev) => ({ ...prev, id: localId }));
  };

  const onChangeFormData = (payload: ISetFormDataPayload) => {
    formRef?.current?.setFormData({ values: payload?.values, mergeValues: payload?.mergeValues });
  };

  //#endregion

  const onFinish = (values: any, options?: any) => {
    if (!submitEndpoint) throw new Error('Submit endpoint is not specified');

    postData(submitEndpoint, values)
      .then(() => {
        message.success('Data saved successfully!');

        publish(DynamicFormPubSubConstants.DataSaved);

        formRef?.current?.setFormMode('readonly');
      })
      .catch((error) => {
        if (options?.setValidationErrors) {
          options.setValidationErrors(error);
        }
      });
  };

  //#region Error messages
  
  const displayNotificationError = (error: IErrorInfo) => {
    app.notification.error({
      message: 'Sorry! An error occurred.',
      icon: null,
      description: <ValidationErrors error={error} renderMode="raw" defaultMessage={null} />,
    });
  };
  
  useEffect(() => {
    if (formWithData.loadingState === 'failed') {
      displayNotificationError(formWithData.error);
    }
  }, [formWithData.loadingState]);

  //#endregion

  //#region On Data Loaded handler
  const executeExpression = (expression: string, context: any = {}) => {
    if (!expression) {
      return null;
    }

    const localContext = {
      data: formWithData?.fetchedData,
      globalState,
      moment,
      message,
      setGlobalState,
      http: axiosHttp(backendUrl),
      query: getQueryParams(),
      // TODO: review on Page/Form life cycle
      form: formRef?.current ? getFormApi(formRef.current) : { formSettings },
      contexts: {...dcm?.getDataContextsData(), lastUpdate: dcm?.lastUpdate},
      pageContext: pageContext?.getFull(),
      application: dcm?.getDataContext(SheshaCommonContexts.ApplicationContext)?.getData(),
      ...context,
    };

    return executeScript(expression, localContext);
  };

  // effect that executes onDataLoaded handler
  useEffect(() => {
    if (formWithData.loadingState === 'ready') {
      const onDataLoaded = formSettings?.onDataLoaded;
      const initialValues = formSettings?.initialValues;
      if (onDataLoaded) {
        executeExpression(onDataLoaded, {
          data: formWithData.fetchedData,
          initialValues: getInitialValues(initialValues, globalState),
        }); // On Data loaded needs the fetched data
      }
    }
  }, [formWithData.loadingState, formWithData.fetchedData]);

  const previousOnInitialized = usePrevious(formSettings?.onInitialized);

  useEffect(() => {
    const onInitialized = formSettings?.onInitialized;

    if (onInitialized && previousOnInitialized !== onInitialized) {
      const initialValues = formSettings?.initialValues;

      if (onInitialized) {
        executeExpression(onInitialized, {
          initialValues: getInitialValues(initialValues, globalState),
          parentFormValues: undefined,
        });
      }
    }
  }, [formSettings?.onInitialized, formRef.current]);

  //#endregion

  const markupErrorCode = formWithData.loadingState === 'failed' ? formWithData.error?.code : null;

  const finalFormSettings = useMemo(() => {
    return formWithData
      ? {
        ...formWithData.form?.settings,
        onInitialized: null
      }
      : undefined;
  }, [formWithData.form?.settings]);

  if (markupErrorCode === 404) {
    return (
      <Result
        status="404"
        style={{ height: '100vh - 55px' }}
        title="404"
        subTitle="Sorry, the page you visited does not exist."
        extra={
          <Button type="primary">
            <Link href={'/'}>
              Back Home
            </Link>
          </Button>
        }
      />
    );
  }

  if (markupErrorCode === 401 || markupErrorCode === 403) {
    return (
      <Result
        status="403"
        style={{ height: '100vh - 55px' }}
        title="403"
        subTitle={getFormForbiddenMessage(formId)}
        extra={
          <Button type="primary">
            <Link href={'/'}>
              Back Home
            </Link>
          </Button>
        }
      />
    );
  }

  const refetchFormData = () => {
    return formWithData.dataFetcher ? formWithData.dataFetcher() : Promise.reject('Data fetcher is not available');
  };

  return (
    <Fragment>
      <div id="modalContainerId" className={classNames('sha-dynamic-page', { 'has-dialog': hasDialog })}>
        <Spin
          spinning={isPostingData}
          tip="Saving data..."
          indicator={<LoadingOutlined style={{ fontSize: 40 }} spin />}
        >
          <Spin
            spinning={formWithData.loadingState === 'loading'}
            tip={formWithData.loaderHint}
            indicator={<LoadingOutlined style={{ fontSize: 40 }} spin />}
          >
            <MetadataProvider id="dynamic" modelType={formSettings?.modelType}>
              {formWithData.loadingState === 'ready' && (
                <ConfigurableForm
                  formName='dynamic-page-form'
                  needDebug
                  formSettings={finalFormSettings}
                  flatStructure={formWithData.form?.flatStructure}
                  formId={formId}
                  formProps={formWithData.form}
                  formRef={formRef}
                  mode={state?.mode}
                  form={form}
                  actions={{ onChangeId, onChangeFormData }}
                  onFinish={onFinish}
                  initialValues={formWithData.fetchedData}
                  skipFetchData
                  refetchData={() => refetchFormData()}
                  refetcher={formWithData.refetcher}
                  className="sha-dynamic-page"
                  isActionsOwner={true}
                />
              )}
            </MetadataProvider>
          </Spin>
        </Spin>
      </div>

      <StackedNavigationModal
        onCancel={onStackedDialogClose}
        title="NAVIGATE"
        open={Boolean(navigationState)}
        parentId={state?.stackId}
      >
        <DynamicPageInternal onCloseDialog={onStackedDialogClose} {...navigationState} />
      </StackedNavigationModal>
    </Fragment>
  );
};

export const DynamicPage: PageWithLayout<IDynamicPageProps> = (props) => {
  return (
    <DataContextProvider id={'pageContext'} name={'pageContext'} type={'page'}>
      <DynamicPageInternal {...props}/>
    </DataContextProvider> 
  );
};