import appConfiguratorReducer from './reducer';
import ConditionalWrap from '@/components/conditionalWrapper';
import DebugPanel from '@/components/debugPanel';
import IRequestHeaders from '@/interfaces/requestHeaders';
import React, { FC, PropsWithChildren, useContext, useReducer, useRef } from 'react';
import { ApplicationActionsProcessor } from './configurable-actions/applicationActionsProcessor';
import { ConfigurableActionDispatcherProvider } from '@/providers/configurableActionsDispatcher';
import { ConfigurationItemsLoaderProvider } from '@/providers/configurationItemsLoader';
import { DataContextManager } from '@/providers/dataContextManager';
import { DataSourcesProvider } from '@/providers/dataSourcesProvider';
import { FRONT_END_APP_HEADER_NAME } from './models';
import { IToolboxComponentGroup } from '@/interfaces';
import { ReferenceListDispatcherProvider } from '@/providers/referenceListDispatcher';
import { IRouter } from '@/providers/shaRouting';
import { SettingsProvider } from '@/providers/settings';
import {
  FormIdentifier,
  IAuthProviderRefProps,
  ThemeProvider,
  ThemeProviderProps,
  DynamicActionsDispatcherProvider,
  MetadataDispatcherProvider,
  AuthProvider,
  ShaRoutingProvider,
  AppConfiguratorProvider,
  DynamicModalProvider,
  CanvasProvider,
} from '@/providers';
import {
  registerFormDesignerComponentsAction,
  setBackendUrlAction,
  setGlobalVariablesAction,
  setHeadersAction,
} from './actions';
import {
  DEFAULT_ACCESS_TOKEN_NAME,
  DEFAULT_SHESHA_ROUTES,
  ISheshaApplication,
  ISheshaApplicationStateContext,
  ISheshaRutes,
  SHESHA_APPLICATION_CONTEXT_INITIAL_STATE,
  SheshaApplicationActionsContext,
  SheshaApplicationStateContext,
} from './contexts';
import { GlobalSheshaStyles } from '@/components/mainLayout/styles/indexStyles';
import { GlobalPageStyles } from '@/components/page/styles/styles';
import { ApplicationContextsProvider } from './context';
import { DataContextProvider } from '../dataContextProvider';
import { SHESHA_ROOT_DATA_CONTEXT_MANAGER, SheshaCommonContexts } from '../dataContextManager/models';
import { useApplicationPlugin, usePublicApplicationApi } from './context/applicationContext';
import { FormManager } from '../formManager';
import { ShaFormStyles } from '@/components/configurableForm/styles/styles';
import { EntityMetadataFetcherProvider } from '../metadataDispatcher/entities/provider';
import { FormDataLoadersProvider } from '../form/loaders/formDataLoadersProvider';
import { FormDataSubmittersProvider } from '../form/submitters/formDataSubmittersProvider';
import { MainMenuProvider } from '../mainMenu';
import { FRONTEND_DEFAULT_APP_KEY } from '@/components/settingsEditor/provider/models';

export interface IShaApplicationProviderProps {
  backendUrl: string;
  applicationName?: string;
  accessTokenName?: string;
  router?: IRouter;
  unauthorizedRedirectUrl?: string;
  themeProps?: ThemeProviderProps;
  routes?: ISheshaRutes;
  noAuth?: boolean;
  homePageUrl?: string;
  /**
   * Unique identifier (key) of the front-end application, is used to separate some settings and application parts when use multiple front-ends
   */
  applicationKey?: string;
  getFormUrlFunc?: (formId: FormIdentifier) => string;
}

const ShaApplicationProvider: FC<PropsWithChildren<IShaApplicationProviderProps>> = (props) => {
  const {
    children,
    backendUrl,
    applicationName,
    applicationKey = FRONTEND_DEFAULT_APP_KEY,
    accessTokenName,
    homePageUrl,
    router,
    unauthorizedRedirectUrl,
    themeProps,
    routes,
    getFormUrlFunc,
  } = props;
  const initialHeaders = applicationKey ? { [FRONT_END_APP_HEADER_NAME]: applicationKey } : {};
  const [state, dispatch] = useReducer(appConfiguratorReducer, {
    ...SHESHA_APPLICATION_CONTEXT_INITIAL_STATE,
    routes: routes ?? DEFAULT_SHESHA_ROUTES,
    backendUrl,
    applicationName,
    applicationKey,
    httpHeaders: initialHeaders,
  });

  const authRef = useRef<IAuthProviderRefProps>();

  const setRequestHeaders = (headers: IRequestHeaders) => {
    dispatch(setHeadersAction(headers));
  };

  const changeBackendUrl = (newBackendUrl: string) => {
    dispatch(setBackendUrlAction(newBackendUrl));
  };

  const anyOfPermissionsGranted = (permissions: string[]) => {
    if (permissions?.length === 0) return true;

    const authorizer = authRef?.current?.anyOfPermissionsGranted;
    return authorizer && authorizer(permissions);
  };

  const setGlobalVariables = (values: { [x: string]: any }) => {
    dispatch(setGlobalVariablesAction(values));
  };

  const registerFormDesignerComponents = (owner: string, components: IToolboxComponentGroup[]) => {
    dispatch(registerFormDesignerComponentsAction({ owner, components }));
  };

  return (
    <SheshaApplicationStateContext.Provider value={state}>
      <SheshaApplicationActionsContext.Provider
        value={{
          changeBackendUrl,
          setRequestHeaders,
          // This will always return false if you're not authorized
          anyOfPermissionsGranted: anyOfPermissionsGranted, // NOTE: don't pass ref directly here, it leads to bugs because some of components use old reference even when authRef is updated
          setGlobalVariables,
          registerFormDesignerComponents,
        }}
      >
        <SettingsProvider>
          <ConfigurableActionDispatcherProvider>
            <ShaRoutingProvider 
              getFormUrlFunc={getFormUrlFunc} 
              router={router}
              getIsLoggedIn={() => authRef?.current?.getIsLoggedIn()}
            >
              <DynamicActionsDispatcherProvider>
                <ConditionalWrap
                  condition={!props.noAuth}
                  wrap={(authChildren) => (
                    <AuthProvider
                      tokenName={accessTokenName || DEFAULT_ACCESS_TOKEN_NAME}
                      onSetRequestHeaders={setRequestHeaders}
                      unauthorizedRedirectUrl={unauthorizedRedirectUrl}
                      authRef={authRef}
                      homePageUrl={homePageUrl}
                    >
                      {authChildren}
                    </AuthProvider>
                  )}
                >
                  <ConfigurationItemsLoaderProvider>
                    <FormManager>
                      <ThemeProvider {...(themeProps || {})}>
                        <GlobalSheshaStyles />
                        <ShaFormStyles />
                        <GlobalPageStyles />

                        <AppConfiguratorProvider>
                          <ReferenceListDispatcherProvider>
                            <EntityMetadataFetcherProvider>
                              <MetadataDispatcherProvider>
                                <DataContextManager id={SHESHA_ROOT_DATA_CONTEXT_MANAGER}>
                                  <ApplicationContextsProvider>
                                    <DataContextProvider
                                      id={SheshaCommonContexts.AppContext}
                                      name={SheshaCommonContexts.AppContext}
                                      description={'Application data store context'}
                                      type={'root'}
                                    >
                                      <FormDataLoadersProvider>
                                        <FormDataSubmittersProvider>
                                          <CanvasProvider>
                                            <DataSourcesProvider>
                                              <DynamicModalProvider>
                                                <DebugPanel>
                                                  <ApplicationActionsProcessor>
                                                    <MainMenuProvider>
                                                      {children}
                                                    </MainMenuProvider>
                                                  </ApplicationActionsProcessor>
                                                </DebugPanel>
                                              </DynamicModalProvider>
                                            </DataSourcesProvider>
                                          </CanvasProvider>
                                        </FormDataSubmittersProvider>
                                      </FormDataLoadersProvider>
                                    </DataContextProvider>
                                  </ApplicationContextsProvider>
                                </DataContextManager>
                              </MetadataDispatcherProvider>
                            </EntityMetadataFetcherProvider>
                          </ReferenceListDispatcherProvider>
                        </AppConfiguratorProvider>
                      </ThemeProvider>
                    </FormManager>
                  </ConfigurationItemsLoaderProvider>
                </ConditionalWrap>
              </DynamicActionsDispatcherProvider>
            </ShaRoutingProvider>
          </ConfigurableActionDispatcherProvider>
        </SettingsProvider>
      </SheshaApplicationActionsContext.Provider>
    </SheshaApplicationStateContext.Provider>
  );
};

const useSheshaApplicationState = (require: boolean = true): ISheshaApplicationStateContext => {
  const stateContext = useContext(SheshaApplicationStateContext);
  if (require && stateContext === undefined) {
    throw new Error('useSheshaApplicationState must be used within a SheshaApplicationStateContext');
  }

  return stateContext;
};

const useSheshaApplication = (require: boolean = true): ISheshaApplication => {
  const stateContext = useContext(SheshaApplicationStateContext);
  const actionsContext = useContext(SheshaApplicationActionsContext);

  if (require && (stateContext === undefined || actionsContext === undefined)) {
    throw new Error('useSheshaApplication must be used within a SheshaApplicationStateContext');
  }

  return { ...stateContext, ...actionsContext };
};

export { ShaApplicationProvider, useSheshaApplication, useSheshaApplicationState, useApplicationPlugin, usePublicApplicationApi };
