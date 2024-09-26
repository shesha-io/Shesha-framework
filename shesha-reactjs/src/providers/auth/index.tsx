import { useMutate } from '@/hooks';
import useThunkReducer, { ThunkDispatch } from '@/hooks/thunkReducer';
import React, { FC, MutableRefObject, PropsWithChildren, useContext, useEffect, useRef } from 'react';
import { GetCurrentLoginInfoOutputAjaxResponse, sessionGetCurrentLoginInfo } from '@/apis/session';
import { AuthenticateModel, AuthenticateResultModelAjaxResponse } from '@/apis/tokenAuth';
import { ResetPasswordVerifyOtpResponse } from '@/apis/user';
import { IAccessToken, IEntityReferenceDto } from '@/interfaces';
import { IHttpHeaders } from '@/interfaces/accessToken';
import { IErrorInfo } from '@/interfaces/errorInfo';
import { IApiEndpoint } from '@/interfaces/metadata';
import IRequestHeaders from '@/interfaces/requestHeaders';
import { HOME_CACHE_URL, URL_CHANGE_PASSWORD, URL_HOME_PAGE, URL_LOGIN_PAGE } from '@/shesha-constants';
import {
  AUTHORIZATION_HEADER_NAME,
  getAccessToken as getAccessTokenFromStorage,
  getHttpHeaders as getHttpHeadersFromToken,
  removeAccessToken as removeTokenFromStorage,
  saveUserToken as saveUserTokenToStorage,
} from '@/utils/auth';
import { getLocalizationOrDefault } from '@/utils/localization';
import { getCustomHeaders, getTenantId } from '@/utils/multitenancy';
import { isSameUrls } from '@/utils/url';
import { useShaRouting } from '@/providers/shaRouting';
import { useSheshaApplication } from '@/providers/sheshaApplication';
import { getFlagSetters } from '../utils/flagsSetters';
import {
  checkAuthAction,
  fetchedUserDataAsyncAction,
  fetchUserDataAction,
  fetchUserDataActionErrorAction,
  fetchUserDataActionSuccessAction,
  loginUserAction,
  loginUserErrorAction,
  loginUserSuccessAction,
  logoutUserAction,
  resetPasswordSuccessAction,
  setAccessTokenAction,
  setIsLoggedInAction,
  verifyOtpSuccessAction,
} from './actions';
import {
  AUTH_CONTEXT_INITIAL_STATE,
  AuthActionsContext,
  AuthStateContext,
  IAuthStateContext,
  ILoginForm,
} from './contexts';
import { authReducer } from './reducer';
import { useLoginUrl } from '@/hooks/useLoginUrl';
import { Action } from 'redux-actions';
import SheshaLoader from '@/components/sheshaLoader';
import { useSettingValue } from '..';

const DEFAULT_HOME_PAGE = '/';
const loginEndpoint: IApiEndpoint = { url: '/api/TokenAuth/Authenticate', httpVerb: 'POST' };
const logoffEndpoint: IApiEndpoint = { url: '/api/TokenAuth/SignOff', httpVerb: 'POST' };

export interface IAuthProviderRefProps {
  anyOfPermissionsGranted?: (permissions: string[]) => boolean;
  headers?: any;
  getIsLoggedIn: () => boolean;
}

interface IAuthProviderProps {
  /**
   * What the token name should be
   *
   * TODO: The whole authorization and storing of token needs to be reviewed
   */
  tokenName: string;

  /**
   * A callback for when the request headers are changed
   */
  onSetRequestHeaders?: (headers: IRequestHeaders) => void;

  /**
   * URL that that the user should be redirected to if they're not authorized. Default is /login
   */
  unauthorizedRedirectUrl?: string;

  /**
   * URL that that the user should be redirected to change the password. Default is /account/change-password
   */
  changePasswordUrl?: string;

  /**
   * Home page url. Default is `/`
   */
  homePageUrl?: string;

  authRef?: MutableRefObject<IAuthProviderRefProps>;
}

const ASPNET_CORE_CULTURE = '.AspNetCore.Culture';
const GENERIC_ERR_MSG = 'Oops, something went wrong';

const AuthProvider: FC<PropsWithChildren<IAuthProviderProps>> = ({
  children,
  tokenName = '',
  onSetRequestHeaders,
  unauthorizedRedirectUrl = URL_LOGIN_PAGE,
  changePasswordUrl = URL_CHANGE_PASSWORD,
  homePageUrl = URL_HOME_PAGE,
  authRef,
}) => {
  const { router } = useShaRouting();
  const { backendUrl, httpHeaders } = useSheshaApplication();

  const { value: defaultUrl, loadingState } = useSettingValue({ module: 'Shesha', name: 'Shesha.DefaultUrl' });

  const storedToken = getAccessTokenFromStorage(tokenName);

  const headersWithoutAuth = { ...(httpHeaders ?? {}) };
  delete headersWithoutAuth[AUTHORIZATION_HEADER_NAME];

  const initialHeaders = { ...headersWithoutAuth, ...getHttpHeadersFromToken(storedToken?.accessToken) };

  const [state, dispatch] = useThunkReducer(authReducer, {
    ...AUTH_CONTEXT_INITIAL_STATE,
    token: storedToken?.accessToken,
    headers: initialHeaders,
  });

  const currentUrl = useRef<string>(router.fullPath);

  const setters = getFlagSetters(dispatch);

  const redirect = (url: string) => {
    router?.push(url);
  };

  //#region Fetch user login info

  const cacheHomeUrl = (url: string) => {
    if (url && url !== URL_HOME_PAGE) localStorage.setItem(HOME_CACHE_URL, url);
  };

  const getHttpHeadersFromState = (providedState: IAuthStateContext): IHttpHeaders => {
    const headers: IHttpHeaders = { ...httpHeaders };

    if (providedState.token) headers['Authorization'] = `Bearer ${providedState.token}`;

    // TODO: move culture and tenant to state and restore from localStorage on start
    headers[ASPNET_CORE_CULTURE] = getLocalizationOrDefault();

    const tenantId = getTenantId();

    if (tenantId) {
      headers['Abp.TenantId'] = getTenantId().toString();
    }

    const additionalHeaders = getCustomHeaders();

    additionalHeaders.forEach(([key, value]) => {
      if (key && value) {
        headers[key] = value?.toString();
      }
    });

    return headers;
  };

  const fireHttpHeadersChanged = (providedState: IAuthStateContext = state) => {
    if (onSetRequestHeaders) {
      const headers = getHttpHeadersFromState(providedState);
      onSetRequestHeaders(headers);
    }
  };

  const clearAccessToken = () => {
    removeTokenFromStorage(tokenName);

    dispatch((dispatchThunk, getState) => {
      dispatchThunk(setAccessTokenAction(null));
      fireHttpHeadersChanged(getState());
    });
  };

  const loginUrl = useLoginUrl({ homePageUrl, unauthorizedRedirectUrl });
  const redirectToUnauthorized = () => {
    redirect(loginUrl);
  };
  const redirectToDefaultUrl = () => {
    redirect(defaultUrl || loginUrl);
  };

  const fetchUserInfo = (headers: IHttpHeaders) => {
    if (state.isFetchingUserInfo || Boolean(state.loginInfo)) return;

    if (Boolean(state.loginInfo)) return;

    dispatch(fetchUserDataAction());
    sessionGetCurrentLoginInfo({ base: backendUrl, headers })
      .then((response) => {
        if (response.result.user) {
          dispatch(fetchUserDataActionSuccessAction(response.result.user));

          dispatch(setIsLoggedInAction(true));

          if (state.requireChangePassword && Boolean(changePasswordUrl)) {
            redirect(changePasswordUrl);
          } else {
            // if we are on the login page - redirect to the returnUrl or home page
            if (isSameUrls(router.path, unauthorizedRedirectUrl)) {
              const returnUrl = router.query['returnUrl']?.toString();

              cacheHomeUrl(response.result?.user?.homeUrl || homePageUrl);

              const redirects: string[] = [returnUrl, response.result?.user?.homeUrl, homePageUrl, DEFAULT_HOME_PAGE];
              const redirectUrl = redirects.find((r) => Boolean(r?.trim())); // skip all null/undefined and empty strings

              redirect(redirectUrl);
            }
          }
        } else {
          // user may be null in some cases
          clearAccessToken();

          dispatch(fetchUserDataActionErrorAction({ message: 'Not authorized' }));

          if (currentUrl.current === '/' || currentUrl.current === '')
            redirectToDefaultUrl();
          else
            redirectToUnauthorized();
        }
      })
      .catch((e) => {
        console.error('failed to fetch user profile', e);
        dispatch(fetchUserDataActionErrorAction({ message: GENERIC_ERR_MSG }));
        redirectToUnauthorized();
      });
  };

  const fetchUserInfoAsync = (headers: IHttpHeaders) =>
    new Promise((resolve, reject) => {
      const error = { message: GENERIC_ERR_MSG };

      sessionGetCurrentLoginInfo({ base: backendUrl, headers })
        .then((response) => {
          dispatch(fetchedUserDataAsyncAction());

          if (response.result.user) {
            if (state.requireChangePassword && Boolean(changePasswordUrl)) {
              resolve({ payload: response, url: changePasswordUrl });
            } else {
              // if we are on the login page - redirect to the returnUrl or home page
              if (isSameUrls(router.path, unauthorizedRedirectUrl)) {
                const returnUrl = router.query['returnUrl']?.toString();

                cacheHomeUrl(response.result?.user?.homeUrl || homePageUrl);

                const redirects: string[] = [returnUrl, response.result?.user?.homeUrl, homePageUrl, DEFAULT_HOME_PAGE];
                const redirectUrl = redirects.find((r) => Boolean(r?.trim())); // skip all null/undefined and empty strings

                resolve({ payload: response, url: redirectUrl });
              } else resolve({ payload: response, url: router.fullPath?.toString() });
            }
          } else {
            const message = 'Not authorized';
            clearAccessToken();
            reject({ message, url: loginUrl });
          }
        })
        .catch((e) => {
          const message = error.message;
          reject({ stackTrace: e, message, url: loginUrl });
        });
    });

  const getHttpHeaders = (): IHttpHeaders => {
    return getHttpHeadersFromState(state);
  };

  //#region `checkAuth`
  const checkAuth = () => {
    dispatch(checkAuthAction());

    const headers = getHttpHeaders();

    if (headers && !state.loginInfo) {
      if (!state.isFetchingUserInfo) {
        fetchUserInfo(headers);
      }
    } else {
      dispatch(loginUserErrorAction({ message: GENERIC_ERR_MSG }));
      redirectToUnauthorized();
    }
  };
  //#endregion

  const getCleanedInitHeaders = <T,>(headers: T) => {
    const propName = Object.getOwnPropertyNames(headers || {});
    if (propName.length === 1 && propName[0] === ASPNET_CORE_CULTURE) {
      return null;
    }

    return headers;
  };

  useEffect(() => {
    if (loadingState === 'loading' || loadingState === 'waiting')
      return;

    const httpHeaders = getCleanedInitHeaders(getHttpHeaders());

    if (!httpHeaders) {
      if (currentUrl.current !== unauthorizedRedirectUrl) {
        if (currentUrl.current === '/' || currentUrl.current === '')
          redirectToDefaultUrl();
        else
          redirectToUnauthorized();
      }
    } else {
      fireHttpHeadersChanged(state);
      if (!state.isCheckingAuth && !state.isFetchingUserInfo) {
        fetchUserInfo(httpHeaders);
      }
    }
  }, [loadingState]);

  //#region  Login
  const { mutate: loginUserHttp } = useMutate<AuthenticateModel, AuthenticateResultModelAjaxResponse>();

  const loginSuccessHandler =
    (dispatchThunk: ThunkDispatch<IAuthStateContext, Action<any>>, getState: () => IAuthStateContext) =>
      (data: AuthenticateResultModelAjaxResponse) =>
        new Promise((resolve, reject) => {
          dispatchThunk(loginUserSuccessAction());
          if (data) {
            const token = data.success && data.result ? (data.result as IAccessToken) : null;
            if (token && token.accessToken) {
              // save token to the localStorage
              saveUserTokenToStorage(token, tokenName);

              // save token to the state
              dispatchThunk(setAccessTokenAction(token.accessToken));

              // get updated state and notify subscribers
              const newState = getState();
              fireHttpHeadersChanged(newState);

              // get new headers and fetch the user info
              const headers = getHttpHeadersFromState(newState);
              fetchUserInfoAsync(headers).then(resolve).catch(reject);
            } else {
              dispatchThunk(loginUserErrorAction(data?.error as IErrorInfo));
              reject({ stackTrace: data?.error, message: GENERIC_ERR_MSG });
            }
          } else reject({ message: GENERIC_ERR_MSG });
        });

  const loginUserAsync = (loginFormData: ILoginForm) =>
    new Promise((resolve, reject) => {
      dispatch((dispatchThunk, getState) => {
        dispatchThunk(loginUserAction()); // We just want to let the user know we're logging in

        loginUserHttp(loginEndpoint, loginFormData)
          .then(loginSuccessHandler(dispatchThunk, getState))
          .then((response: any) => {
            dispatch(fetchUserDataActionSuccessAction(response?.payload?.result?.user));
            dispatch(setIsLoggedInAction(true));
            resolve(response);
          })
          .catch((err) => {
            dispatchThunk(loginUserErrorAction(err?.data));
            reject(err);
          });
      });
    });

  const loginUser = (loginFormData: ILoginForm) => {
    dispatch(fetchUserDataAction());

    loginUserAsync(loginFormData)
      .then((response) => {
        const { url } = response as { payload: GetCurrentLoginInfoOutputAjaxResponse; url: string };

        redirect(url);
      })
      .catch((e) => {
        const message = e?.message || e?.data?.error?.message || 'Not authorized';
        const url = e?.url;

        dispatch(fetchUserDataActionErrorAction({ message }));

        if (url) redirect(url);
      });
  };
  //#endregion

  //#region Logout user
  const { mutate: signOffRequest } = useMutate();

  /**
   * Logout success
   */
  const logoutSuccess = (resolve) => {
    clearAccessToken();
    dispatch(logoutUserAction());
    redirect(unauthorizedRedirectUrl);
    resolve(null);
  };

  /**
   * Log the user
   */
  const logoutUser = () =>
    new Promise((resolve, reject) =>
      signOffRequest(logoffEndpoint)
        .then(() => logoutSuccess(resolve))
        .catch(() => reject())
    );

  //#endregion

  const anyOfPermissionsGranted = (permissions: string[], permissionedEntities?: IEntityReferenceDto[]) => {
    const { loginInfo } = state;
    if (!loginInfo) return false;

    if (!permissions || permissions.length === 0) return true;

    const granted = loginInfo.grantedPermissions || [];

    return permissions.some((p) =>
      granted.some(gp =>
        gp.permission === p
        && (
          !gp.permissionedEntity
          || gp.permissionedEntity.length === 0
          || gp.permissionedEntity.some(pe => permissionedEntities?.some(ppe => pe?.id === ppe?.id && ppe?._className === pe?._className))
        )
      )
    );
  };

  if (authRef)
    authRef.current = {
      anyOfPermissionsGranted,
      headers: state?.headers,
      getIsLoggedIn: () => state?.isLoggedIn,
    };

  const anyOfPermissionsGrantedWrapper = (permissions: string[]) => {
    if (permissions?.length === 0) return true;

    const granted = anyOfPermissionsGranted(permissions);

    return granted;
  };

  //#region Reset password
  /**
   * @param verifyOtpResPayload - the payload for resetting the password
   */
  const verifyOtpSuccess = (verifyOtpResPayload: ResetPasswordVerifyOtpResponse) => {
    // Redirect to the reset password page

    // redirect(URL_RESET_PASSWORD);
    dispatch(verifyOtpSuccessAction(verifyOtpResPayload));
  };

  // This action will simply clear state.verifyOtpResPayload
  const resetPasswordSuccess = () => {
    dispatch(resetPasswordSuccessAction());
  };

  // Done fetching user info but the state is not yet updated
  const showLoader =
    !state.hasFetchedUserInfoAsync &&
    !!(state.isFetchingUserInfo || (!state.isFetchingUserInfo && !state.loginInfo && state.token));

  //#endregion

  const getAccessToken = () => {
    return state.token;
  };

  if (showLoader) {
    return <SheshaLoader message="Initializing..." />;
  }

  /* NEW_ACTION_DECLARATION_GOES_HERE */

  return (
    <AuthStateContext.Provider value={state}>
      <AuthActionsContext.Provider
        value={{
          ...setters,
          checkAuth,
          getAccessToken,
          loginUser,
          loginUserAsync,
          logoutUser,
          anyOfPermissionsGranted: anyOfPermissionsGrantedWrapper,
          verifyOtpSuccess,
          resetPasswordSuccess,
          fireHttpHeadersChanged,
          /* NEW_ACTION_GOES_HERE */
        }}
      >
        {children}
      </AuthActionsContext.Provider>
    </AuthStateContext.Provider>
  );
};

function useAuthState(require: boolean = true) {
  const context = useContext(AuthStateContext);
  if (require && context === undefined) {
    throw new Error('useAuthState must be used within a AuthProvider');
  }
  return context;
}

function useAuthActions(require: boolean = true) {
  const context = useContext(AuthActionsContext);
  if (require && context === undefined) {
    throw new Error('useAuthActions must be used within a AuthProvider');
  }
  return context;
}

function useAuth(require: boolean = true) {
  const actionsContext = useAuthActions(require);
  const stateContext = useAuthState(require);

  // useContext() returns initial state when provider is missing
  // initial context state is useless especially when require == true
  // so we must return value only when both context are available
  return actionsContext !== undefined && stateContext !== undefined
    ? { ...actionsContext, ...stateContext }
    : undefined;
}

export default AuthProvider;

export { AuthProvider, useAuth, useAuthActions, useAuthState };
