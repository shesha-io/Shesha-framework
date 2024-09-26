import React from 'react';
import { IToolboxComponent } from '@/interfaces';
import { SplitCellsOutlined } from '@ant-design/icons';
import { Row, Col } from 'antd';
import { IFormComponentContainer, useFormData, useGlobalState } from '@/providers';
import { nanoid } from '@/utils/uuid';
import { IColumnsComponentProps } from './interfaces';
import { getLayoutStyle } from '@/providers/form/utils';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { ColumnsSettingsForm } from './columnsSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import ParentProvider from '@/providers/parentProvider/index';
import ComponentsContainer from '@/components/formDesigner/containers/componentsContainer';
import { removeComponents } from '../_common-migrations/removeComponents';

const ColumnsComponent: IToolboxComponent<IColumnsComponentProps> = {
  type: 'columns',
  isInput: false,
  name: 'Columns',
  icon: <SplitCellsOutlined />,
  Factory: ({ model }) => {
    const { data } = useFormData();
    const { globalState } = useGlobalState();
    const { columns, gutterX = 0, gutterY = 0 } = model as IColumnsComponentProps;

    if (model.hidden) return null;

    return (
      <Row gutter={[gutterX, gutterY]} style={getLayoutStyle(model, { data, globalState })}>
        <ParentProvider model={model}>
          {columns &&
            columns.map((col, index) => (
              <Col
                key={index}
                md={col.flex}
                offset={col.offset}
                pull={col.pull}
                push={col.push}
                className="sha-designer-column"
              >
                <ComponentsContainer
                  containerId={col.id}
                  dynamicComponents={model?.isDynamic ? col?.components : []}
                />
              </Col>
            ))}
        </ParentProvider>
      </Row>
    );
  },
  migrator: (m) =>
    m
      .add<IColumnsComponentProps>(
        0,
        (prev) => migratePropertyName(migrateCustomFunctions(prev)) as IColumnsComponentProps
      )
      .add<IColumnsComponentProps>(1, (prev) => migrateVisibility(prev))
      .add<IColumnsComponentProps>(2, (prev) => removeComponents(prev)),
  initModel: (model) => {
    const tabsModel: IColumnsComponentProps = {
      ...model,
      propertyName: 'custom Name',
      columns: [
        { id: nanoid(), flex: 12, offset: 0, push: 0, pull: 0, components: [] },
        { id: nanoid(), flex: 12, offset: 0, push: 0, pull: 0, components: [] },
      ],
      gutterX: 12,
      gutterY: 12,
      stylingBox: "{\"marginBottom\":\"5\"}"
    };

    return tabsModel;
  },
  settingsFormFactory: (props) => <ColumnsSettingsForm {...props} />,
  customContainerNames: ['columns'],
  getContainers: (model) => {
    return model.columns.map<IFormComponentContainer>((t) => ({ id: t.id }));
  },
};

export default ColumnsComponent;
