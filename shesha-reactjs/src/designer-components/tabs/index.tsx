import ComponentsContainer from '@/components/formDesigner/containers/componentsContainer';
import React, { Fragment } from 'react';
import ShaIcon from '@/components/shaIcon';
import { FolderOutlined } from '@ant-design/icons';
import { getActualModelWithParent, getLayoutStyle, useAvailableConstantsData } from '@/providers/form/utils';
import { IFormComponentContainer } from '@/providers/form/models';
import { ITabsComponentProps } from './models';
import { IToolboxComponent } from '@/interfaces';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { nanoid } from '@/utils/uuid';
import { Tabs, TabsProps } from 'antd';
import { TabSettingsForm } from './settings';
import { useDeepCompareMemo } from '@/hooks';
import { useFormData, useGlobalState, useSheshaApplication } from '@/providers';
import ParentProvider from '@/providers/parentProvider/index';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { removeComponents } from '../_common-migrations/removeComponents';

type TabItem = TabsProps['items'][number];

const TabsComponent: IToolboxComponent<ITabsComponentProps> = {
  type: 'tabs',
  isInput: false,
  name: 'Tabs',
  icon: <FolderOutlined />,
  Factory: ({ model }) => {
    const { anyOfPermissionsGranted } = useSheshaApplication();
    const allData = useAvailableConstantsData();
    const { data } = useFormData();
    const { globalState } = useGlobalState();

    const { tabs, defaultActiveKey, tabType = 'card', size, position = 'top' } = model;

    const actionKey = defaultActiveKey || (tabs?.length && tabs[0]?.key);

    const items = useDeepCompareMemo(() => {
      const tabItems: TabItem[] = [];

      (tabs ?? [])?.forEach((item) => {
        const tabModel = getActualModelWithParent(item, allData, { model: { readOnly: model.readOnly } });
        const {
          id,
          key,
          title,
          icon,
          closable,
          className,
          forceRender,
          animated,
          destroyInactiveTabPane,
          closeIcon,
          permissions,
          hidden,
          readOnly,
          selectMode,
          components,
        } = tabModel;

        const granted = anyOfPermissionsGranted(permissions || []);
        if ((!granted || hidden) && allData.form?.formMode !== 'designer') return;

        const tab: TabItem = {
          key: key,
          label: icon ? (
            <Fragment>
              <ShaIcon iconName={icon as any} /> {title}
            </Fragment>
          ) : (
            <Fragment>
              {icon} {title}
            </Fragment>
          ),
          closable: closable,
          className: className,
          forceRender: forceRender,
          animated: animated,
          destroyInactiveTabPane: destroyInactiveTabPane,
          closeIcon: closeIcon ? <ShaIcon iconName={closeIcon as any} /> : null,
          disabled: selectMode === 'readOnly' || selectMode === 'inherited' && readOnly,
          style: getLayoutStyle(model, { data, globalState }),
          children: (
            <ParentProvider model={tabModel}>
              <ComponentsContainer containerId={id} dynamicComponents={model?.isDynamic ? components : []} />
            </ParentProvider>
          ),
        };
        tabItems.push(tab);
      });

      return tabItems;
    }, [tabs, model.readOnly, allData.contexts.lastUpdate, allData.data, allData.form?.formMode, allData.globalState, allData.selectedRow]);

    return model.hidden ? null : (
      <Tabs defaultActiveKey={actionKey} size={size} type={tabType} tabPosition={position} items={items} />
    );
  },
  initModel: (model) => {
    const tabsModel: ITabsComponentProps = {
      ...model,
      propertyName: 'custom Name',
      stylingBox: "{\"marginBottom\":\"5\"}",
      tabs: [{ id: nanoid(), label: 'Tab 1', title: 'Tab 1', key: 'tab1', components: [] }],
    };
    return tabsModel;
  },
  migrator: (m) => m
    .add<ITabsComponentProps>(0, (prev) => {
      const newModel = { ...prev };
      newModel['tabs'] = prev['tabs']?.map((item) => migrateCustomFunctions(item as any));
      return migratePropertyName(migrateCustomFunctions(newModel)) as ITabsComponentProps;
    })
    .add<ITabsComponentProps>(1, (prev) => {
      const newModel = { ...prev };
      newModel.tabs = newModel.tabs.map(x => migrateReadOnly(x, 'inherited'));
      return newModel;
    })
    .add<ITabsComponentProps>(2, (prev) => ({ ...migrateFormApi.properties(prev) }))
    .add<ITabsComponentProps>(3, (prev) => removeComponents(prev))
  ,
  settingsFormFactory: (props) => <TabSettingsForm {...props} />,
  customContainerNames: ['tabs'],
  getContainers: (model) => {
    return model.tabs.map<IFormComponentContainer>((t) => ({ id: t.id }));
  },
};

export default TabsComponent;
