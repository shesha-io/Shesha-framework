import ComponentsContainer from '@/components/formDesigner/containers/componentsContainer';
import moment from 'moment';
import ParentProvider from '@/providers/parentProvider/index';
import React, { FC, Fragment, useState } from 'react';
import {
  Alert,
  Button,
  Drawer,
  DrawerProps,
  message,
  Space
  } from 'antd';
import { axiosHttp } from '@/utils/fetchers';
import { executeScriptSync } from '@/providers/form/utils';
import { IConfigurableActionConfiguration } from '@/interfaces/configurableAction';
import { IDrawerProps } from './models';
import { useForm, useGlobalState, useSheshaApplication } from '@/providers';
import {
  useConfigurableAction,
  useConfigurableActionDispatcher,
} from '@/providers/configurableActionsDispatcher';

export interface IShaDrawerProps extends Omit<IDrawerProps, 'style' | 'size'>, Omit<DrawerProps, 'id'> { }

interface IShaDrawerState {
  open?: boolean;
}

const ShaDrawer: FC<IShaDrawerProps> = props => {
  const {
    id,
    placement,
    width,
    propertyName: name,
    readOnly,
    label,
    onOkAction,
    onCancelAction,
    okText,
    cancelText,
    components,
    isDynamic,
    okButtonCustomEnabled,
    cancelButtonCustomEnabled,
  } = props;
  const { backendUrl } = useSheshaApplication();
  const [state, setState] = useState<IShaDrawerState>();
  const { formMode, formData } = useForm();
  const { globalState, setState: setGlobalState } = useGlobalState();
  const { executeAction } = useConfigurableActionDispatcher();

  const openDrawer = () => setState(prev => ({ ...prev, open: true }));

  const closeDrawer = () => setState(prev => ({ ...prev, open: false }));

  const actionOwnerName = `Drawer (${name})`;

  const actionEvaluationContext = {
    data: formData,
    formMode: formMode,
    globalState,
    http: axiosHttp(backendUrl),
    message,
    setGlobalState,
    moment: moment,
  };

  /// NAVIGATION
  const executeActionIfConfigured = (actionConfiguration: IConfigurableActionConfiguration) => {
    if (!actionConfiguration) {
      console.warn(`Action not configured '${actionConfiguration.toString()}'`);
      return;
    }

    executeAction({
      actionConfiguration: actionConfiguration,
      argumentsEvaluationContext: actionEvaluationContext,
    });
  };

  const onOkHandler = () => {
    executeActionIfConfigured(onOkAction);
  };

  const onCancelHandler = () => {
    executeActionIfConfigured(onCancelAction);
  };

  useConfigurableAction(
    {
      name: 'Open drawer',
      owner: actionOwnerName,
      ownerUid: id,
      hasArguments: false,
      executer: () => {
        openDrawer(); // todo: return real promise
        return Promise.resolve();
      },
    },
    [state]
  );

  useConfigurableAction(
    {
      name: 'Close drawer',
      owner: actionOwnerName,
      ownerUid: id,
      hasArguments: false,
      executer: () => {
        closeDrawer(); // todo: return real promise
        return Promise.resolve();
      },
    },
    [state]
  );

  const context = {
    data: formData,
    globalState,
  };

  const okButtonDisabled = !!okButtonCustomEnabled ? !executeScriptSync<boolean>(okButtonCustomEnabled, context) : false;
  const cancelButtonDisabled = !!cancelButtonCustomEnabled ? !executeScriptSync<boolean>(cancelButtonCustomEnabled, context) : false;

  if (formMode === 'designer') {
    return (
      <Fragment>
        <Alert
          type="warning"
          message="This component only shows in designer mode. Otherwise it will show only in the drawer"
          showIcon
        />
        <ComponentsContainer containerId={id} />
      </Fragment>
    );
  }

  return (
    <Drawer
      open={state?.open}
      placement={placement}
      width={width}
      onClose={closeDrawer}
      title={label}
      size="large"
      footer={
        <Space>
          <Button onClick={onCancelHandler} disabled={cancelButtonDisabled}>
            {cancelText || 'Cancel'}
          </Button>

          <Button type="primary" onClick={onOkHandler} disabled={okButtonDisabled}>
            {okText || 'Ok'}
          </Button>
        </Space>
      }
    >
      <ParentProvider model={props}>
        <ComponentsContainer
          containerId={id}
          dynamicComponents={isDynamic ? components?.map(c => ({ ...c, readOnly: readOnly })) : []}
        />
      </ParentProvider>
    </Drawer>
  );
};

ShaDrawer.displayName = 'ShaDrawer';

export { ShaDrawer };

export default ShaDrawer;
