import { ConfigurableFormInstance } from '@/interfaces';
import { createContext } from 'react';
import { ButtonGroupItemProps } from './models';

export interface IUpdateChildItemsPayload {
  index: number[];
  id?: string;
  children: ButtonGroupItemProps[];
}

export interface IUpdateItemSettingsPayload {
  id: string;
  settings: ButtonGroupItemProps;
}

export interface IButtonGroupConfiguratorStateContext {
  items: ButtonGroupItemProps[];
  form: ConfigurableFormInstance | null | undefined;
  selectedItemId?: string;
  buttonCount: number;
  groupCount: number,
  readOnly: boolean;
}

export interface IButtonGroupConfiguratorActionsContext {
  addButton: () => void;
  deleteButton: (uid: string) => void;

  addGroup: () => void;
  deleteGroup: (uid: string) => void;
  selectItem: (uid: string) => void;
  updateChildItems: (payload: IUpdateChildItemsPayload) => void;

  getItem: (uid: string) => ButtonGroupItemProps;
  updateItem: (payload: IUpdateItemSettingsPayload) => void;

  /* NEW_ACTION_ACTION_DECLARATIOS_GOES_HERE */
}

export const BUTTON_GROUP_CONTEXT_INITIAL_STATE: IButtonGroupConfiguratorStateContext = {
  items: [],
  buttonCount: 0,
  groupCount: 0,
  form: null,
  readOnly: false,
};

export const ButtonGroupConfiguratorStateContext = createContext<IButtonGroupConfiguratorStateContext>(
  BUTTON_GROUP_CONTEXT_INITIAL_STATE
);

export const ButtonGroupConfiguratorActionsContext = createContext<IButtonGroupConfiguratorActionsContext>(undefined);
