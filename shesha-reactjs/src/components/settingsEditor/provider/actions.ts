import { createAction } from 'redux-actions';
import { FormMode } from '../../..';
import { IEditorBridge, IFetchApplicationsErrorPayload, IFetchApplicationsSuccessPayload, IFetchConfigurationsErrorPayload, IFetchConfigurationsSuccessPayload, ISettingSelection } from './contexts';

export enum SettingsEditorActionEnums {
  /* NEW_ACTION_TYPE_GOES_HERE */
  FetchConfigurations = 'FETCH_CONFIGURATIONS',
  FetchConfigurationsSuccess = 'FETCH_CONFIGURATIONS_SUCCEESS',
  FetchConfigurationsError = 'FETCH_CONFIGURATIONS_ERROR',
  FetchApplications = 'FETCH_APPLICATIONS',
  FetchApplicationsSuccess = 'FETCH_APPLICATIONS_SUCCESS',
  FetchApplicationsError = 'FETCH_APPLICATIONS_ERROR',
  SelectSetting = 'SELECT_SETTING',
  SetEditorMode = 'SET_EDITOR_MODE',
  SetEditorBridge = 'SET_EDITOR_BRIDGE',
}

/* NEW_ACTION_GOES_HERE */

export const fetchConfigurationsAction = createAction<void, void>(
  SettingsEditorActionEnums.FetchConfigurations,
  p => p
);
export const fetchConfigurationsSuccessAction = createAction<IFetchConfigurationsSuccessPayload, IFetchConfigurationsSuccessPayload>(
  SettingsEditorActionEnums.FetchConfigurationsSuccess,
  p => p
);
export const fetchConfigurationsErrorAction = createAction<IFetchConfigurationsErrorPayload, IFetchConfigurationsErrorPayload>(
  SettingsEditorActionEnums.FetchConfigurationsError,
  p => p
);

export const fetchApplicationsAction = createAction<void, void>(
  SettingsEditorActionEnums.FetchApplications,
  p => p
);
export const fetchApplicationsSuccessAction = createAction<IFetchApplicationsSuccessPayload, IFetchApplicationsSuccessPayload>(
  SettingsEditorActionEnums.FetchApplicationsSuccess,
  p => p
);
export const fetchApplicationsErrorAction = createAction<IFetchApplicationsErrorPayload, IFetchApplicationsErrorPayload>(
  SettingsEditorActionEnums.FetchApplicationsError,
  p => p
);

export const selectSettingAction = createAction<ISettingSelection, ISettingSelection>(
  SettingsEditorActionEnums.SelectSetting,
  p => p
);

export const setEditorModeAction = createAction<FormMode, FormMode>(
  SettingsEditorActionEnums.SetEditorMode,
  p => p
);

export const setEditorBridgeAction = createAction<IEditorBridge, IEditorBridge>(
  SettingsEditorActionEnums.SetEditorBridge,
  p => p
);