import classNames from 'classnames';
import React, { FC, PropsWithChildren, ReactNode } from 'react';
import { ISidebarProps, SidebarPanelPosition } from './models';
import { useStyles } from './styles/styles';
import ResizableWrapper from './sidebarContainerWrapper';


export interface ISidebarContainerProps extends PropsWithChildren<any> {
  /**
   * Left sidebar props
   */
  leftSidebarProps?: ISidebarProps;

  /**
   * Right sidebar props
   */
  rightSidebarProps?: ISidebarProps;

  /**
   * Container header
   */
  header?: ReactNode | (() => ReactNode);

  /**
   * sidebar width. By default it's 250px
   */
  sideBarWidth?: number;

  allowFullCollapse?: boolean;


}

export const SidebarContainer: FC<ISidebarContainerProps> = ({
  leftSidebarProps,
  rightSidebarProps,
  header,
  children,
  allowFullCollapse = false,
  noPadding,
}) => {
  const { styles } = useStyles();
  const RenderSidebar = (side: SidebarPanelPosition) => {

    const sidebarProps = side === 'left' ? leftSidebarProps : rightSidebarProps;

    return sidebarProps
      ? (
        <ResizableWrapper  {...sidebarProps} allowFullCollapse={allowFullCollapse} side={side} />
      )
      : null;
  };

  return (
    <div className={styles.sidebarContainer}>
      {header && <div className={styles.sidebarContainerHeader}>{typeof header === 'function' ? header() : header}</div>}

      <div className={styles.sidebarContainerBody}>

        {RenderSidebar('left')}
        <div
          className={classNames(
            styles.sidebarContainerMainArea,
            { 'both-open': leftSidebarProps?.open && rightSidebarProps?.open },
            { 'left-only-open': leftSidebarProps?.open && !rightSidebarProps?.open },
            { 'right-only-open': rightSidebarProps?.open && !leftSidebarProps?.open },
            { 'no-left-panel': !leftSidebarProps },
            { 'no-right-panel': !rightSidebarProps },
            { 'no-padding': noPadding },
            { 'allow-full-collapse': allowFullCollapse }

          )}
        >
          <div className={styles.sidebarContainerMainAreaBody}>{children}</div>
        </div>
        {RenderSidebar('right')}
      </div>
    </div>
  );
};
