import { handleActions } from 'redux-actions';
import { AppConfiguratorActionEnums } from './actions';
import { APP_CONTEXT_INITIAL_STATE, IAppStateContext } from './contexts';
import { ApplicationMode, ConfigurationItemsViewMode } from './models';

export default handleActions<IAppStateContext, any>(
  {
    [AppConfiguratorActionEnums.SwitchMode]: (
      state: IAppStateContext,
      action: ReduxActions.Action<ApplicationMode>
    ) => {
      const { payload } = action;

      return {
        ...state,
        mode: payload,
        editModeConfirmationVisible: false,
        closeEditModeConfirmationVisible: false,
      };
    },
    [AppConfiguratorActionEnums.ToggleEditModeConfirmation]: (
      state: IAppStateContext,
      action: ReduxActions.Action<boolean>
    ) => {
      const { payload } = action;

      return {
        ...state,
        editModeConfirmationVisible: payload,
        closeEditModeConfirmationVisible: !payload,
      };
    },
    [AppConfiguratorActionEnums.ToggleCloseEditModeConfirmation]: (
      state: IAppStateContext,
      action: ReduxActions.Action<boolean>
    ) => {
      const { payload } = action;

      return {
        ...state,
        closeEditModeConfirmationVisible: payload,
        editModeConfirmationVisible: !payload,
      };
    },
    [AppConfiguratorActionEnums.SwitchConfigurationItemsMode]: (
      state: IAppStateContext,
      action: ReduxActions.Action<ConfigurationItemsViewMode>
    ) => {
      const { payload } = action;

      return {
        ...state,
        configurationItemMode: payload,
      };
    },
    [AppConfiguratorActionEnums.ToggleFormInfoBlock]: (
      state: IAppStateContext,
      action: ReduxActions.Action<boolean>
    ) => {
      const { payload } = action;

      return {
        ...state,
        formInfoBlockVisible: payload,
      };
    },
    [AppConfiguratorActionEnums.SetTargetForm]: (
      state: IAppStateContext,
      action: ReduxActions.Action<boolean>
    ) => {
      const { payload } = action;

      return {
        ...state,
        targetForm: payload as unknown as string,
      };
    },
  },

  APP_CONTEXT_INITIAL_STATE
);
