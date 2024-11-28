import React from 'react';
import { IToolboxComponent } from '@/interfaces';
import { BorderLeftOutlined } from '@ant-design/icons';
import { nanoid } from '@/utils/uuid';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { KeyInformationBarSettingsForm } from './settings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import ParentProvider from '@/providers/parentProvider/index';
import { IKeyInformationBarProps } from './interfaces';
import KeyInformationBar from '@/components/keyInformationBar';
import { removeComponents } from '../_common-migrations/removeComponents';


const ColumnsComponent: IToolboxComponent<IKeyInformationBarProps> = {
  type: 'KeyInformationBar',
  isInput: false,
  name: 'Key Information Bar',
  icon: <BorderLeftOutlined />,
  Factory: ({ model }) => {

    return (
      <ParentProvider model={model}>
        <KeyInformationBar {...model} />
      </ParentProvider >
    );
  },
  migrator: (m) =>
    m
      .add<IKeyInformationBarProps>(
        0,
        (prev) => migratePropertyName(migrateCustomFunctions(prev)) as IKeyInformationBarProps
      )
      .add<IKeyInformationBarProps>(1, (prev) => migrateVisibility(prev))
      .add<IKeyInformationBarProps>(2, (prev) => removeComponents(prev)),
  initModel: (model) => {
    const tabsModel: IKeyInformationBarProps = {
      ...model,
      propertyName: 'column 1',
      columns: [
        {
          id: nanoid(),
          width: 200,
          textAlign: 'center',
          flexDirection: 'column',
          components: [],
          padding: '0px',
        }
      ],
      orientation: 'horizontal',
      stylingBox: "{\"marginBottom\":\"5\"}"
    };

    return tabsModel;
  },
  settingsFormFactory: (props) => <KeyInformationBarSettingsForm {...props} />,
  customContainerNames: ['columns'],
};

export default ColumnsComponent;
