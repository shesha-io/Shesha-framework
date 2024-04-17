import { EllipsisOutlined } from '@ant-design/icons';
import { Alert } from 'antd';
import React, { useCallback, useMemo } from 'react';
import { EntityPicker } from '@/components';
import { migrateDynamicExpression } from '@/designer-components/_common-migrations/migrateUseExpression';
import { IToolboxComponent } from '@/interfaces';
import { DataTypes } from '@/interfaces/dataTypes';
import { useForm } from '@/providers';
import { IConfigurableColumnsProps } from '@/providers/datatableColumnsConfigurator/models';
import { FormIdentifier, IConfigurableFormComponent } from '@/providers/form/models';
import { executeExpression, getStyle, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { ITableViewProps } from '@/providers/tableViewSelectorConfigurator/models';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { migrateV0toV1 } from './migrations/migrate-v1';
import { entityPickerSettings } from './settingsForm';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { isEntityReferencePropertyMetadata } from '@/interfaces/metadata';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { IncomeValueFunc, OutcomeValueFunc } from '@/components/entityPicker/models';

export interface IEntityPickerComponentProps extends IConfigurableFormComponent {
  placeholder?: string;
  items: IConfigurableColumnsProps[];
  hideBorder?: boolean;
  valueFormat?: 'simple' | 'entityReference' | 'custom';
  incomeCustomJs?: string;
  outcomeCustomJs?: string;
  mode?: 'single' | 'multiple' | 'tags';
  entityType: string;
  filters?: object;
  title?: string;
  displayEntityKey?: string;
  allowNewRecord?: boolean;
  modalFormId?: FormIdentifier;
  modalTitle?: string;
  showModalFooter?: boolean;
  onSuccessRedirectUrl?: string;
  submitHttpVerb?: 'POST' | 'PUT';
  modalWidth?: number | string | 'custom';
  customWidth?: number;
  widthUnits?: string;
}

const EntityPickerComponent: IToolboxComponent<IEntityPickerComponentProps> = {
  type: 'entityPicker',
  isInput: true,
  isOutput: true,
  name: 'Entity Picker',
  icon: <EllipsisOutlined />,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.entityReference,
  Factory: ({ model }) => {
    const { filters, modalWidth, customWidth, widthUnits, style } = model;
    const { formMode, formData } = useForm();

    const entityPickerFilter = useMemo<ITableViewProps[]>(() => {
      return [
        {
          defaultSelected: true,
          expression: { ...filters },
          id: 'uZ4sjEhzO7joxO6kUvwdb',
          name: 'entity Picker',
          selected: true,
          sortOrder: 0,
        },
      ];
    }, [filters]);

    const incomeValueFunc: IncomeValueFunc = useCallback( (value: any, args: any) => {
      if (model.valueFormat === 'entityReference') {
        return !!value ? value.id : null;
      }
      if (model.valueFormat === 'custom') {
        return executeExpression<string>(model.incomeCustomJs, {...args, value}, null, null );
      }
      return value;
    }, [model.valueFormat, model.incomeCustomJs]);

    const outcomeValueFunc: OutcomeValueFunc = useCallback((value: any, args: any) => {
      if (model.valueFormat === 'entityReference') {
        return !!value
          ? {id: value.id, _displayName: value[model.displayEntityKey] ??  value._displayName, _className: model.entityType}
          : null;
      }
      if (model.valueFormat === 'custom') {
        return executeExpression(model.outcomeCustomJs, {...args, value}, null, null );
      }
      return !!value ? value.id : null;
    }, [model.valueFormat, model.outcomeCustomJs, model.displayEntityKey, model.entityType]);

    if (formMode === 'designer' && !model.entityType) {
      return (
        <Alert
          showIcon
          message="EntityPicker not configured properly"
          description="Please make sure that you've specified 'entityType' property."
          type="warning"
        />
      );
    }

    const width = modalWidth === 'custom' && customWidth ? `${customWidth}${widthUnits}` : modalWidth;
    const computedStyle = getStyle(style, formData) ?? {};

    return (
      <ConfigurableFormItem model={model} initialValue={model.defaultValue}>
        {(value, onChange) => {
          return (
          <EntityPicker
            incomeValueFunc={incomeValueFunc}
            outcomeValueFunc={outcomeValueFunc}

            placeholder={model.placeholder}
            style={computedStyle}
            formId={model.id}
            readOnly={model.readOnly}
            displayEntityKey={model.displayEntityKey}
            entityType={model.entityType}
            filters={entityPickerFilter}
            mode={model.mode}
            addNewRecordsProps={
              model.allowNewRecord
                ? {
                  modalFormId: model.modalFormId,
                  modalTitle: model.modalTitle,
                  showModalFooter: model.showModalFooter,
                  submitHttpVerb: model.submitHttpVerb,
                  onSuccessRedirectUrl: model.onSuccessRedirectUrl,
                  modalWidth: customWidth ? `${customWidth}${widthUnits}` : modalWidth,
                }
                : undefined
            }
            name={model?.componentName}
            width={width}
            configurableColumns={model.items ?? []}
            value={value}
            onChange={onChange}
            size={model.size}
          />
        );
        }}
      </ConfigurableFormItem>
    );
  },
  migrator: m => m
    .add<IEntityPickerComponentProps>(0, prev => {
      return {
        ...prev,
        items: prev['items'] ?? [],
        mode: prev['mode'] ?? 'single',
        entityType: prev['entityType'],
      };
    })
    .add<IEntityPickerComponentProps>(1, migrateV0toV1)
    .add<IEntityPickerComponentProps>(2, prev => {
      return { ...prev, useRawValues: true };
    })
    .add<IEntityPickerComponentProps>(3, prev => {
      const result = { ...prev };
      const useExpression = Boolean(result['useExpression']);
      delete result['useExpression'];

      if (useExpression) {
        const migratedExpression = migrateDynamicExpression(prev.filters);
        result.filters = migratedExpression;
      }

      return result;
    })
    .add<IEntityPickerComponentProps>(4, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IEntityPickerComponentProps>(5, (prev) => migrateVisibility(prev))
    .add<IEntityPickerComponentProps>(6, (prev) => migrateReadOnly(prev))
    .add<IEntityPickerComponentProps>(7, (prev, context) => ({
      ...prev,
      valueFormat: prev.valueFormat  ??
        context.isNew
          ? 'simple'
          : prev['useRawValue'] === true 
            ? 'simple' 
            : 'entityReference',
    }))
  ,
  settingsFormMarkup: entityPickerSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(entityPickerSettings, model),
  linkToModelMetadata: (model, propMetadata): IEntityPickerComponentProps => {
    return {
      ...model,
      entityType: isEntityReferencePropertyMetadata(propMetadata) ? propMetadata.entityType : undefined,
      valueFormat: 'simple',
    };
  },
  getFieldsToFetch: (propertyName, rawModel)  => {
      if (rawModel.valueFormat === 'entityReference') {
        return [
          `${propertyName}.id`,
          rawModel.displayEntityKey
            ? `${propertyName}.${rawModel.displayEntityKey}`
            : `${propertyName}._displayName`,
          `${propertyName}._className`
        ];
      }
      return null;
  },
};

export default EntityPickerComponent;