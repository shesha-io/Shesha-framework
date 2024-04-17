import { ProfileOutlined } from '@ant-design/icons';
import React from 'react';
import { useFormData } from '@/providers';
import { IToolboxComponent } from '@/interfaces';
import { DataTypes } from '@/interfaces/dataTypes';
import { FormMarkup } from '@/providers/form/models';
import { getStyle, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { IReferenceListIdentifier } from '@/interfaces/referenceList';
import { getLegacyReferenceListIdentifier } from '@/utils/referenceList';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import RefListCheckboxGroup from './refListCheckboxGroup';
import settingsFormJson from './settingsForm.json';
import { ICheckboxGroupProps } from './utils';
import { migratePropertyName, migrateCustomFunctions, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';

const settingsForm = settingsFormJson as FormMarkup;

interface IEnhancedICheckboxGoupProps extends Omit<ICheckboxGroupProps, 'style'> {
  style?: string;
}

const CheckboxGroupComponent: IToolboxComponent<IEnhancedICheckboxGoupProps> = {
  type: 'checkboxGroup',
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  name: 'Checkbox group',
  icon: <ProfileOutlined />,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.referenceListItem,
  Factory: ({ model }) => {
    const { data } = useFormData();

    return (
      <ConfigurableFormItem model={model}>
        {(value, onChange) => 
          <RefListCheckboxGroup {...model} style={getStyle(model?.style, data)} value={value} onChange={onChange}/>
        }
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
  initModel: model => {
    const customProps: IEnhancedICheckboxGoupProps = {
      ...model,
      dataSourceType: 'values',
      direction: 'horizontal',
      mode: 'single',
    };
    return customProps;
  },
  migrator: m => m
    .add<IEnhancedICheckboxGoupProps>(0, prev => ({
      ...prev,
      dataSourceType: prev['dataSourceType'] ?? 'values',
      direction: prev['direction'] ?? 'horizontal',
      mode: prev['mode'] ?? 'single',
    }))
    .add<IEnhancedICheckboxGoupProps>(1, prev => {
      return {
        ...prev,
        referenceListId: getLegacyReferenceListIdentifier(prev.referenceListNamespace, prev.referenceListName),
      };
    })
    .add<IEnhancedICheckboxGoupProps>(2, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IEnhancedICheckboxGoupProps>(3, (prev) => migrateVisibility(prev))
    .add<IEnhancedICheckboxGoupProps>(4, (prev) => migrateReadOnly(prev))
  ,
  linkToModelMetadata: (model, metadata): IEnhancedICheckboxGoupProps => {
    const refListId: IReferenceListIdentifier = metadata.referenceListName
      ? { module: metadata.referenceListModule, name: metadata.referenceListName }
      : null;
    return {
      ...model,
      dataSourceType: metadata.dataType === DataTypes.referenceListItem ? 'referenceList' : 'values',
      referenceListId: refListId,
    };
  },
};

export default CheckboxGroupComponent;
