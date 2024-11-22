import React, { FC, useRef } from 'react';
import { Collapse, Skeleton, theme } from 'antd';
import { CollapseProps } from 'antd/lib/collapse';
import classNames from 'classnames';
import styled from 'styled-components';
import { useStyles } from './styles/styles';
import { useParent } from '@/providers/parentProvider';

const { Panel } = Collapse;
const { useToken } = theme;

export type defaultHeaderType = 'settings' | 'default';

export interface ICollapsiblePanelProps extends CollapseProps {
  isActive?: boolean;
  header?: React.ReactNode;
  className?: string;
  extraClassName?: string;
  style?: React.CSSProperties;
  showArrow?: boolean;
  forceRender?: boolean;
  extra?: React.ReactNode;
  noContentPadding?: boolean;
  loading?: boolean;
  collapsedByDefault?: boolean;
  headerColor?: string;
  bodyColor?: string;
  isSimpleDesign?: boolean;
  hideCollapseContent?: boolean;
  hideWhenEmpty?: boolean;
  parentPanel?: boolean;
  primaryColor?: string;
  hasBorder?: boolean;
  hasHeaderBorder?: boolean;
  dynamicBorderRadius?: number;
}

/**
 * There was an error 
 * TS4023: Exported variable 'xxx' has or is using name 'zzz' from external module "yyy" but cannot be named.
 * 
 * found a solution
 * https://stackoverflow.com/questions/43900035/ts4023-exported-variable-x-has-or-is-using-name-y-from-external-module-but
 * 
 */

const StyledCollapse: any = styled(Collapse) <
  Omit<ICollapsiblePanelProps, 'collapsible' | 'showArrow' | 'header' | 'extraClassName' | 'extra' | 'radius'>
>`
  .ant-collapse-header {
    visibility: ${({ hideCollapseContent }) => (hideCollapseContent ? 'hidden' : 'visible')};
    border-top: ${({ parentPanel, primaryColor, hasHeaderBorder }) => (parentPanel && hasHeaderBorder ? `3px solid  ${primaryColor}` : 'none')};
    border-left: ${({ parentPanel, primaryColor, hasHeaderBorder }) => (!parentPanel && hasHeaderBorder ? `3px solid  ${primaryColor}` : 'none')};
    font-size: ${({ parentPanel }) => (parentPanel ? '13px' : '16px')};
    font-weight: 'bold';
    background-color: ${({ headerColor }) => headerColor} !important;
    
  }
  .ant-collapse-content {
    .ant-collapse-content-box > .sha-components-container {
      background-color: ${({ bodyColor }) => bodyColor};
    }
  }
`;

export const CollapsiblePanel: FC<Omit<ICollapsiblePanelProps, 'radiusLeft' | 'radiusRight'>> = ({
  expandIconPosition = 'end',
  onChange,
  header,
  extra,
  children,
  noContentPadding,
  loading,
  className,
  extraClassName,
  style,
  collapsedByDefault = false,
  showArrow,
  collapsible,
  ghost,
  bodyColor = 'unset',
  headerColor = 'unset',
  isSimpleDesign,
  hideCollapseContent,
  hideWhenEmpty = false,
  parentPanel = false,
  dynamicBorderRadius,

}) => {
  // Prevent the CollapsiblePanel from collapsing every time you click anywhere on the extra and header
  const onContainerClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => event?.stopPropagation();
  const { styles } = useStyles({ borderRadius: dynamicBorderRadius });
  const panelRef = useRef(null);
  const { token } = useToken();
  const { model: { hasHeaderBorder = true } } = useParent();

  const shaCollapsiblePanelStyle = isSimpleDesign ? {} : styles.shaCollapsiblePanel;

  return (
    <StyledCollapse
      defaultActiveKey={collapsedByDefault ? [] : ['1']}
      onChange={onChange}
      expandIconPosition={expandIconPosition}
      className={classNames(shaCollapsiblePanelStyle, className, { [styles.noContentPadding]: noContentPadding, [styles.hideWhenEmpty]: hideWhenEmpty })}
      style={{ ...style, borderTopLeftRadius: dynamicBorderRadius, borderTopRightRadius: dynamicBorderRadius }}
      ghost={ghost}
      bodyColor={bodyColor}
      headerColor={headerColor}
      hideCollapseContent={hideCollapseContent}
      parentPanel={parentPanel}
      primaryColor={token.colorPrimary}
      hasHeaderBorder={hasHeaderBorder}
    >
      <Panel
        key="1"
        collapsible={collapsible}
        showArrow={showArrow}
        header={header || ' '}
        className='sha-panel'
        ref={panelRef}
        extra={
          <span onClick={onContainerClick} className={extraClassName}>
            {extra}
          </span>
        }
      >
        <Skeleton loading={loading}>{children}</Skeleton>
      </Panel>
    </StyledCollapse>
  );
};

export default CollapsiblePanel;
