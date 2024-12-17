import { AutocompleteDataSourceType } from '@/components/autocomplete';
import { CodeLanguages } from '../codeEditor/types';
import { ResultType } from '@/components/codeEditor/models';
import { IComponentLabelProps, IConfigurableFormComponent } from '@/index';
import { SizeType } from 'antd/es/config-provider/SizeContext';

interface IRadioOption {
    value: string | number;
    icon?: string | React.ReactNode;
    title?: string;
}

interface IDropdownOption {
    label: string | React.ReactNode;
    value: string;
}

interface InputType {
    type: 'color' | 'dropdown' | 'radio' | 'switch' | 'number' | 'button' | 'buttonGroupConfigurator'
    | 'customDropdown' | 'textArea' | 'codeEditor' | 'iconPicker' | 'contextPropertyAutocomplete' | 'text' | 'queryBuilder' | 'formAutocomplete' |
    'autocomplete' | 'imageUploader' | 'editModeSelector' | 'permissions' | 'multiColorPicker' | 'propertyAutocomplete' | 'columnsConfig';
}
export interface ISettingsInputProps extends IComponentLabelProps, Omit<IConfigurableFormComponent, 'label' | 'layout' | 'readOnly' | 'style' | 'propertyName'> {
    type: InputType['type'];
    label: string;
    propertyName: string;
    variant?: 'borderless' | 'filled' | 'outlined';
    buttonGroupOptions?: IRadioOption[];
    dropdownOptions?: IDropdownOption[];
    readOnly?: boolean;
    onChange?: (value: any) => void;
    hasUnits?: boolean;
    hidden?: boolean;
    jsSetting?: boolean;
    children?: React.ReactNode;
    tooltip?: string;
    suffix?: string;
    size?: SizeType;
    width?: string | number;
    hideLabel?: boolean;
    layout?: 'horizontal' | 'vertical';
    language?: CodeLanguages;
    style?: string;
    wrapperCol?: { span: number };
    fileName?: string;
    availableConstantsExpression?: string;
    resultType?: ResultType;
    value?: any;
    exposedVariables?: string[];
    dropdownMode?: 'multiple' | 'tags';
    allowClear?: boolean;
    className?: string;
    icon?: string | React.ReactNode;
    iconAlt?: string | React.ReactNode;
    inline?: boolean;
    inputType?: InputType['type'];
    dataSourceType?: AutocompleteDataSourceType;
    dataSourceUrl?: string;
    modelType?: string;
    min?: number;
    max?: number;
    fieldsUnavailableHint?: string;
    items?: [];
};
