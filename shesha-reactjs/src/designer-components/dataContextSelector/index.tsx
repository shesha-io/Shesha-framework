import { IToolboxComponent } from '../../interfaces';
import { CodeOutlined } from '@ant-design/icons';
import ConfigurableFormItem from '../../components/formDesigner/components/formItem';
import React, { FC } from 'react';
import { IConfigurableFormComponent, useForm, useMetadataDispatcher } from '../../providers';
import { DataTypes, StringFormats } from '../../interfaces/dataTypes';
import { Select } from 'antd';
import { useDataContextManager } from 'providers/dataContextManager';

interface IDataContextSelectorComponentProps extends IConfigurableFormComponent {}

const DataContextSelector: FC<any> = (model) => {
  const { getActiveContext } = useDataContextManager();
  const dataContexts = [];
  let dataContext = getActiveContext();
  while (!!dataContext) {
    dataContexts.push(dataContext);
    dataContext = dataContext.parentDataContext;
  }

  const metadataDispatcher = useMetadataDispatcher();

  const onChange = (value: any) => {
    if (value) {
      metadataDispatcher.activateProvider(value);
    }
    model.onChange(value);
  };

  return (
    <Select allowClear={true} disabled={model.readOnly} showSearch value={model.value} onChange={onChange}>
      {dataContexts.map((item) => {
        return <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>;
      })}
    </Select>
  );
};

const DataContextSelectorComponent: IToolboxComponent<IDataContextSelectorComponentProps> = {
    type: 'dataContextSelector',
    isInput: true,
    isOutput: true,
    isHidden: true,
    name: 'DataContext selector',
    icon: <CodeOutlined />,
    dataTypeSupported: ({ dataType, dataFormat }) => dataType === DataTypes.string && dataFormat === StringFormats.singleline,
    factory: (model: IDataContextSelectorComponentProps, _c, _f, _ch) => {
      const { formMode, isComponentDisabled } = useForm();
      const disabled = isComponentDisabled(model);
      const readOnly = model?.readOnly || disabled || (formMode === 'readonly');

      return (
        <ConfigurableFormItem model={{...model, readOnly}}>
          <DataContextSelector {...model}/>
        </ConfigurableFormItem>
      );
    },
    initModel: (model) => ({
      ...model,
    }),
    linkToModelMetadata: (model): IDataContextSelectorComponentProps => {
      return {
        ...model,
      };
    },
  };
  
  export { DataContextSelector } ;

  export default DataContextSelectorComponent;