import QueryBuilderExpressionViewer from '@/designer-components/queryBuilder/queryBuilderExpressionViewer';
import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useState
  } from 'react';
import { Alert, Tabs } from 'antd';
import { CodeVariablesTables } from '@/components/codeVariablesTable';
import { QueryBuilderPlainRenderer } from '@/designer-components/queryBuilder/queryBuilderFieldPlain';
import { QueryBuilderProvider, useMetadata } from '@/providers';
import { SidebarContainer } from '@/components';
import { TableViewProperties } from './tableViewProperties';
import { useStyles } from '@/designer-components/_common/styles/listConfiguratorStyles';
import { useTableViewSelectorConfigurator } from '@/providers/tableViewSelectorConfigurator';

const { TabPane } = Tabs;

export interface ITableViewSelectorConfiguratorProps { }

export interface ITableViewSelectorConfiguratorHandles {
  saveFilters: () => void;
}

export const TableViewSelectorConfigurator = forwardRef<
  ITableViewSelectorConfiguratorHandles,
  ITableViewSelectorConfiguratorProps
>(({ }, forwardedRef) => {
  const { styles } = useStyles();

  const metadata = useMetadata(false);

  const { selectedItemId, updateItem, items, readOnly } = useTableViewSelectorConfigurator();
  const selectedItem = useMemo(() => items?.find(({ id }) => id === selectedItemId), [items, selectedItemId]);
  const [localQueryExpression, setLocalQueryExpression] = useState<any>(selectedItem?.expression);

  const onSet = (value) => {
    setLocalQueryExpression(value);
  };

  const onQueryBuilderValueChange = () => {
    // NOTE: we must save even empty filter
    updateItem({
      id: selectedItemId,
      settings: { ...selectedItem, expression: localQueryExpression },
    });
  };
  useImperativeHandle(forwardedRef, () => ({
    saveFilters() {
      onQueryBuilderValueChange();
    },
  }));

  const queryBuilderValue = useMemo(() => {
    return selectedItem?.expression;
  }, [selectedItem, selectedItemId, items]);

  return (
    <div className={styles.shaToolbarConfigurator}>
      <SidebarContainer
        rightSidebarProps={{
          open: true,
          title: () => 'Properties',
          content: () => <TableViewProperties />,
          resizable: true,
          configurator: true,
        }}
      >
        {!readOnly && (
          <Alert message="Here you can adjust filter settings" className={styles.shaToolbarConfiguratorAlert} />
        )}

        <QueryBuilderProvider metadata={metadata?.metadata}>
          <Tabs
            defaultActiveKey="queryBuilderConfigureTab"
            className={styles.shaToolbarConfiguratorBodyTabs}
            destroyInactiveTabPane
            onChange={onQueryBuilderValueChange}
          >
            <TabPane tab="Query builder" key="queryBuilderConfigureTab">
              <QueryBuilderPlainRenderer onChange={onSet} value={queryBuilderValue} readOnly={readOnly} />
            </TabPane>

            <TabPane tab="Query expression viewer" key="expressionViewerTab">
              <QueryBuilderExpressionViewer value={queryBuilderValue} />
            </TabPane>

            <TabPane tab="Variables" key="exposedVariables">
              <CodeVariablesTables
                data={[
                  {
                    id: '61955479-c9fd-4613-b639-d2be14795245',
                    name: 'data',
                    description: 'The state of the form',
                    type: 'object',
                  },
                  {
                    id: 'e27dd783-c204-4b53-a6a0-babe4cb46e39',
                    name: 'globalState',
                    description: 'The global state',
                    type: 'object',
                  },
                ]}
              />
            </TabPane>
          </Tabs>
        </QueryBuilderProvider>
      </SidebarContainer>
    </div>
  );
});

export type TableViewSelectorConfiguratorRefType = React.ElementRef<typeof TableViewSelectorConfigurator>;

export default TableViewSelectorConfigurator;
