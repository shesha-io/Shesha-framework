import { LineOutlined } from '@ant-design/icons';
import { Divider, DividerProps } from 'antd';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import React from 'react';
import { validateConfigurableComponentSettings } from '@/formDesignerUtils';
import { IConfigurableFormComponent, IToolboxComponent } from '@/interfaces/formDesigner';
import { FormMarkup } from '@/providers/form/models';
import ComponentsContainer from '@/components/formDesigner/containers/componentsContainer';
import settingsFormJson from './settingsForm.json';
import { useFormData, useGlobalState } from '@/providers';
import { getLayoutStyle } from '@/providers/form/utils';
import ParentProvider from '@/providers/parentProvider/index';

export interface IDividerProps extends IConfigurableFormComponent {
  container?: boolean;
  dividerType?: 'horizontal' | 'vertical';
  orientation?: 'left' | 'right' | 'center';
  orientationMargin?: string | number;
  dashed?: boolean;
  plain?: boolean;
  components?: IConfigurableFormComponent[];
}

const settingsForm = settingsFormJson as FormMarkup;

const DividerComponent: IToolboxComponent<IDividerProps> = {
  type: 'divider',
  name: 'Divider',
  icon: <LineOutlined />,
  Factory: ({ model }) => {
    const { data } = useFormData();
    const { globalState } = useGlobalState();

    const props: DividerProps = {
      type: model?.dividerType,
      orientation: model?.orientation,
      orientationMargin: model?.orientationMargin,
      dashed: model?.dashed,
      plain: model?.plain,
    };

    return model?.container ? (
      <ParentProvider model={model}><ComponentsContainer containerId={model.id} render={(components) => <Divider {...props}>{components}</Divider>} /></ParentProvider>
    ) : (
      <Divider style={getLayoutStyle(model, { data, globalState })} {...props} />
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
  migrator: (m) => m.add<IDividerProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev))),
  initModel: (model) => ({
    dividerType: 'horizontal',
    orientation: 'center',
    dashed: false,
    plain: true,
    ...model,
  }),
};

export default DividerComponent;
