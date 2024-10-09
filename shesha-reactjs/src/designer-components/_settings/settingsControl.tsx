import React, { FC, ReactElement, useCallback } from 'react';
import { getPropertySettingsFromValue } from './utils';
import { CodeEditor, IObjectMetadata, IPropertySetting, PropertySettingMode, useFormData } from '@/index';
import { Button } from 'antd';
import { useStyles } from './styles/styles';
import { isEqual } from 'lodash';
import { ICodeExposedVariable } from '@/components/codeVariablesTable';
import camelcase from 'camelcase';
import { executeScript } from '@/providers/form/utils';
import { useMetadataBuilderFactory } from '@/utils/metadata/hooks';
import { ICodeEditorProps } from '../codeEditor/interfaces';
import { CodeEditorWithStandardConstants } from '../codeEditor/codeEditorWithConstants';

export type SettingsControlChildrenType = (value: any, onChange: (val: any) => void, propertyName: string) => ReactElement;

export interface ISettingsControlProps {
  propertyName: string;
  readOnly?: boolean;
  value?: IPropertySetting;
  mode: PropertySettingMode;
  onChange?: (value: IPropertySetting) => void;
  readonly children?: SettingsControlChildrenType;
  availableConstantsExpression?: string;
}

const defaultExposedVariables: ICodeExposedVariable[] = [
  { name: "data", description: "Selected form values", type: "object" },
  { name: "pageContext", description: "Contexts data of current page", type: "object" },
  { name: "contexts", description: "Contexts data", type: "object" },
  { name: "globalState", description: "Global state", type: "object" },
  { name: "setGlobalState", description: "Functiont to set globalState", type: "function" },
  { name: "formMode", description: "Form mode", type: "'designer' | 'edit' | 'readonly'" },
  { name: "form", description: "Form instance", type: "object" },
  { name: "selectedRow", description: "Selected row of nearest table (null if not available)", type: "object" },
  { name: "moment", description: "moment", type: "object" },
  { name: "http", description: "axiosHttp", type: "object" },
  { name: "message", description: "message framework", type: "object" },
];

export const SettingsControl: FC<ISettingsControlProps> = (props) => {

  const { styles } = useStyles();
  const metadataBuilderFactory = useMetadataBuilderFactory();
  const { data: formData } = useFormData();

  const usePassedConstants = props.availableConstantsExpression?.trim();
  const constantsAccessor = useCallback((): Promise<IObjectMetadata> => {
    if (!props.availableConstantsExpression?.trim())
      return Promise.reject("AvailableConstantsExpression is mandatory");

    const metadataBuilder = metadataBuilderFactory();
  
    return executeScript<IObjectMetadata>(props.availableConstantsExpression, { data: formData, metadataBuilder });
  }, [props.availableConstantsExpression, metadataBuilderFactory, formData]);

  const setting = getPropertySettingsFromValue(props.value);
  const { _mode: mode, _code: code } = setting;

  const onInternalChange = (value: IPropertySetting, m?: PropertySettingMode) => {
    const newSetting = { ...value, _mode: (m ?? mode) };
    const newValue = !!newSetting._code || newSetting._mode === 'code' ? newSetting : value._value;
    if (props.onChange)
      props.onChange(newValue);
  };

  const codeOnChange = (val: any) => {
    const newValue = { ...setting, _code: val };
    onInternalChange(newValue);
  };

  const valueOnChange = (val: any) => {
    if (!isEqual(setting?._value, val)) {
      const newValue = { ...setting, _value: val };
      onInternalChange(newValue);
    }
  };

  const onSwitchMode = () => {
    const newMode = mode === 'code' ? 'value' : 'code';
    onInternalChange(setting, newMode);
  };

  const propertyName = !!setting._code || setting._mode === 'code' ? `${props.propertyName}._value` : props.propertyName;
  const functionName = `get${camelcase(props.propertyName, { pascalCase: true })}`;  

  const codeEditorProps: ICodeEditorProps = {
    readOnly: props.readOnly,
    value: setting._code,
    onChange: codeOnChange,
    mode: 'dialog',
    language: 'typescript',
    propertyName: props.propertyName + 'Code',
    fileName: props.propertyName,
    wrapInTemplate: true,
    templateSettings: { functionName: functionName },
    exposedVariables: defaultExposedVariables
  };

  const editor = usePassedConstants
    ? <CodeEditor {...codeEditorProps} availableConstants={constantsAccessor}/>
    : <CodeEditorWithStandardConstants {...codeEditorProps}/>;

  return (
    <div className={mode === 'code' ? styles.contentCode : styles.contentJs}>
      <Button
        hidden={props.readOnly}
        shape="round"
        className={styles.jsSwitch}
        type='primary'
        danger={mode === 'value' && !!code}
        ghost
        size='small'
        onClick={onSwitchMode}
      >
        {mode === 'code' ? 'Value' : 'JS'}
      </Button>
      <div className={styles.jsContent}>
        {mode === 'code' && editor}
        {mode === 'value' && props.children(setting?._value, valueOnChange, propertyName)}
      </div>
    </div>
  );
};

export default SettingsControl;
