import React from 'react';
import { ButtonGroup } from './buttonGroup';
import { ButtonGroupItemProps, isGroup, isItem } from '@/providers/buttonGroupConfigurator/models';
import { ButtonGroupSettingsForm } from './settings';
import { GroupOutlined } from '@ant-design/icons';
import { IButtonGroupComponentProps } from './models';
import { IToolboxComponent } from '@/interfaces';
import { migrateButtonsNavigateAction } from './migrations/migrateButtonsNavigateAction';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateV0toV1 } from './migrations/migrate-v1';
import { migrateV1toV2 } from './migrations/migrate-v2';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { useForm } from '@/providers/form';
import { useSheshaApplication } from '@/providers';

const ButtonGroupComponent: IToolboxComponent<IButtonGroupComponentProps> = {
  type: 'buttonGroup',
  name: 'Button Group',
  icon: <GroupOutlined />,
  Factory: ({ model }) => {
    const { formMode } = useForm();
    const { anyOfPermissionsGranted } = useSheshaApplication();
    const granted = anyOfPermissionsGranted(model?.permissions || []);

    if ((model.hidden || !granted) && formMode !== 'designer') return null;

    return <ButtonGroup {...model} disabled={model.readOnly} />;
  },
  migrator: (m) => m
    .add<IButtonGroupComponentProps>(0, (prev) => {
      return {
        ...prev,
        items: prev['items'] ?? [],
      };
    })
    .add<IButtonGroupComponentProps>(1, migrateV0toV1)
    .add<IButtonGroupComponentProps>(2, migrateV1toV2)
    .add<IButtonGroupComponentProps>(3, (prev) => ({ ...prev, isInline: prev['isInline'] ?? true, })) /* default isInline to true if not specified */
    .add<IButtonGroupComponentProps>(4, (prev) => {
      const newModel = { ...prev };
      newModel.items = prev.items?.map((item) => migrateCustomFunctions(item as any));
      return migratePropertyName(migrateCustomFunctions(newModel));
    })
    .add<IButtonGroupComponentProps>(5, (prev) => {
      const newModel = { ...prev };

      const updateItemDefaults = (item: ButtonGroupItemProps): ButtonGroupItemProps => {
        if (isItem(item) && item.itemSubType === 'line')
          return { ...item, itemSubType: 'separator', buttonType: item.buttonType ?? 'link' }; // remove `line`, it works by the same way as `separator`

        if (isGroup(item) && typeof (item.hideWhenEmpty) === 'undefined')
          return {
            ...item,
            buttonType: item.buttonType ?? 'link',
            hideWhenEmpty: true, // set default `hideWhenEmpty` to true by default
            childItems: (item.childItems ?? []).map(updateItemDefaults),
          };

        return { ...item };
      };

      newModel.items = prev.items?.map(updateItemDefaults);
      return newModel;
    })
    .add<IButtonGroupComponentProps>(6, (prev) => migrateVisibility(prev))
    .add<IButtonGroupComponentProps>(7, (prev) => migrateButtonsNavigateAction(prev))
    .add<IButtonGroupComponentProps>(8, (prev) => {
      const newModel = {...prev, editMode: 'editable'} as IButtonGroupComponentProps;

      const updateItems = (item: ButtonGroupItemProps): ButtonGroupItemProps => {
        const newItem = migrateReadOnly(item, 'inherited');
        if (Array.isArray(newItem['childItems']))
          newItem['childItems'] = newItem['childItems'].map(updateItems);
        return newItem;
      };

      newModel.items = newModel.items.map(updateItems);
      return newModel ;
    })
  ,
  settingsFormFactory: (props) => (<ButtonGroupSettingsForm {...props} />),
};

export default ButtonGroupComponent;