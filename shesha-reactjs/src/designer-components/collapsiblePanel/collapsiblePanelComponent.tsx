import ComponentsContainer from '@/components/formDesigner/containers/componentsContainer';
import { CollapsiblePanel, headerType } from '@/components/panel';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { IToolboxComponent } from '@/interfaces';
import { useFormData, useGlobalState, useSheshaApplication } from '@/providers';
import { useForm } from '@/providers/form';
import { evaluateString, pickStyleFromModel, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { GroupOutlined } from '@ant-design/icons';
import { ExpandIconPosition } from 'antd/lib/collapse/Collapse';
import { nanoid } from '@/utils/uuid';
import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { ICollapsiblePanelComponentProps, ICollapsiblePanelComponentPropsV0 } from './interfaces';
import { executeFunction } from '@/utils';
import ParentProvider from '@/providers/parentProvider/index';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { removeComponents } from '../_common-migrations/removeComponents';
import { getSettings } from './settingsForm';
import { getBackgroundImageUrl, getBackgroundStyle } from '../_settings/utils/background/utils';
import { getSizeStyle } from '../_settings/utils/dimensions/utils';
import { getBorderStyle } from '../_settings/utils/border/utils';
import { getFontStyle } from '../_settings/utils/font/utils';
import { getShadowStyle } from '../_settings/utils/shadow/utils';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { defaultHeaderStyles, defaultStyles } from './utils';

type PanelContextType = 'parent' | 'child' | undefined;

const PanelContext = createContext<PanelContextType>(undefined);

const CollapsiblePanelComponent: IToolboxComponent<ICollapsiblePanelComponentProps> = {
  type: 'collapsiblePanel',
  isInput: false,
  name: 'Panel',
  icon: <GroupOutlined />,
  Factory: ({ model }) => {
    const { formMode, formSettings } = useForm();
    const { data } = useFormData();
    const { globalState } = useGlobalState();
    const { backendUrl, httpHeaders } = useSheshaApplication();
    const isFormSettings = formSettings?.isSettingsForm;
    const [finalStyle, setFinalStyle] = useState<React.CSSProperties>({});
    const [headerFinalStyle, setCardFinalStyle] = useState<React.CSSProperties>({});

    const {
      label,
      expandIconPosition,
      collapsedByDefault,
      collapsible,
      // ghost,
      bodyColor,
      hideCollapseContent,
      hideWhenEmpty,
      dimensions,
      border,
      font,
      shadow,
      headerStyles,
      hasCustomHeader,
      isDynamic,
      customHeader,
      content,
      className,
      hidden,
      stylingBox
    } = model;

    const panelContextState = useContext(PanelContext);

    const evaluatedLabel = useMemo(() => (
      typeof label === 'string' ? evaluateString(label, data) : label
    ), [label, data]);

    const styling = useMemo(() => JSON.parse(stylingBox || '{}'), [stylingBox]);
    const stylingHeader = useMemo(() => JSON.parse(stylingBox || '{}'), [stylingBox]);

    const getBodyStyle = useMemo(() => ({
      ...pickStyleFromModel(styling),
      ...(executeFunction(model?.style, { data, globalState }) || {}),
    }), [styling, model?.style, data, globalState]);

    const getHeaderStyle = useMemo(() => ({
      ...pickStyleFromModel(stylingHeader),
      ...(executeFunction(model?.style, { data, globalState }) || {}),
    }), [stylingHeader, model?.style, data, globalState]);

    const style = useMemo(() => ({
      ...getSizeStyle(dimensions),
      ...getBorderStyle(border, getBodyStyle),
      ...getFontStyle(font),
      ...getShadowStyle(shadow),
      ...getBodyStyle
    }), [dimensions, border, font, shadow, getBodyStyle]);

    const headerStyle = useMemo(() => ({
      ...getSizeStyle(headerStyles?.dimensions),
      ...getBorderStyle(headerStyles?.border, getHeaderStyle),
      ...getFontStyle(headerStyles?.font),
      ...getShadowStyle(headerStyles?.shadow),
      ...getHeaderStyle
    }), [headerStyles, getHeaderStyle]);

    useEffect(() => {
      const fetchTabStyles = async () => {
        const background = model?.background;
        const headerBackground = headerStyles?.background;

        const storedImageUrl = await getBackgroundImageUrl(background, backendUrl, httpHeaders);
        const headerStoredImageUrl = await getBackgroundImageUrl(headerBackground, backendUrl, httpHeaders);

        const backgroundStyle = await getBackgroundStyle(background, getBodyStyle, storedImageUrl);
        const headerBackgroundStyle = await getBackgroundStyle(headerBackground, getHeaderStyle, headerStoredImageUrl);

        setCardFinalStyle({ ...headerBackgroundStyle, ...headerStyle });
        setFinalStyle({ ...backgroundStyle, ...style });
      };

      fetchTabStyles();
    }, [model.background, headerStyles?.background, backendUrl, httpHeaders, getBodyStyle, getHeaderStyle, style, headerStyle]);

    const headerComponents = model?.header?.components ?? [];

    const extra = ((headerComponents?.length > 0 || formMode === 'designer') && !hasCustomHeader) ? (
      <ComponentsContainer
        containerId={model.header?.id}
        direction="horizontal"
        dynamicComponents={isDynamic ? headerComponents : []}
      />
    ) : null;

    const panelPosition = panelContextState ? 'child' : 'parent';

    const headType: headerType = isFormSettings ? 'default' : panelPosition;

    if (hidden) return null;

    return (
      <ParentProvider model={model}>
        <PanelContext.Provider value={panelPosition}>
          <CollapsiblePanel
            header={hasCustomHeader ? (
              <ComponentsContainer
                containerId={customHeader.id}
                dynamicComponents={isDynamic ? customHeader?.components : []}
              />
            ) : evaluatedLabel}
            expandIconPosition={expandIconPosition !== 'hide' ? (expandIconPosition as ExpandIconPosition) : 'start'}
            collapsedByDefault={collapsedByDefault}
            extra={extra}
            collapsible={collapsible === 'header' ? 'header' : 'icon'}
            showArrow={collapsible !== 'disabled' && expandIconPosition !== 'hide'}
            ghost={true}
            bodyStyle={finalStyle}
            headerStyle={headerFinalStyle}
            className={className}
            bodyColor={bodyColor}
            isSimpleDesign={true}
            panelHeadType={headType}
            hideCollapseContent={hideCollapseContent}
            hideWhenEmpty={hideWhenEmpty}
          >
            <ComponentsContainer
              containerId={content.id}
              dynamicComponents={isDynamic ? content.components : []}
            />
          </CollapsiblePanel>
        </PanelContext.Provider>
      </ParentProvider>
    );
  },
  settingsFormMarkup: () => getSettings(),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(), model),
  migrator: (m) =>
    m
      .add<ICollapsiblePanelComponentPropsV0>(0, (prev) => {
        return {
          ...prev,
          expandIconPosition: 'right',
        };
      })
      .add<ICollapsiblePanelComponentProps>(1, (prev, context) => {
        const header = { id: nanoid(), components: [] };
        const content = { id: nanoid(), components: [] };

        delete context.flatStructure.componentRelations[context.componentId];
        context.flatStructure.componentRelations[content.id] = [];
        content.components =
          prev.components?.map((x) => {
            context.flatStructure.allComponents[x.id].parentId = content.id;
            context.flatStructure.componentRelations[content.id].push(x.id);
            return { ...x, parentId: content.id };
          }) ?? [];

        return {
          ...prev,
          components: undefined,
          header,
          content,
          collapsible: 'icon',
        };
      })
      .add<ICollapsiblePanelComponentProps>(2, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
      .add<ICollapsiblePanelComponentProps>(3, (prev) => ({
        ...prev,
        expandIconPosition:
          prev.expandIconPosition === 'left'
            ? 'start'
            : prev.expandIconPosition === 'right'
              ? 'end'
              : prev.expandIconPosition,
      }))
      .add<ICollapsiblePanelComponentProps>(4, (prev) => migrateVisibility(prev))
      .add<ICollapsiblePanelComponentProps>(5, (prev) => ({ ...migrateFormApi.properties(prev) }))
      .add<ICollapsiblePanelComponentProps>(6, (prev) => removeComponents(prev))
      .add<ICollapsiblePanelComponentProps>(7, (prev) => ({
        ...prev,
        customHeader: { id: nanoid(), components: [] }
      }))
      .add<ICollapsiblePanelComponentProps>(8, (prev) => ({ ...prev, stylingBox: "{\"marginBottom\":\"5\"}" }))
      .add<ICollapsiblePanelComponentProps>(9, (prev) => {
        const newModel = migratePrevStyles(prev, defaultStyles());
        return { ...newModel, desktop: { ...newModel.desktop, headerStyles: defaultHeaderStyles() }, tablet: { ...newModel.tablet, headerStyles: defaultHeaderStyles() }, mobile: { ...newModel.mobile, headerStyles: defaultHeaderStyles() } };
      }),
  customContainerNames: ['header', 'content', 'customHeader'],
};

export default CollapsiblePanelComponent;