import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }, { styles, cardStyles }) => {

    const borderTop = `${styles.borderTopWidth ? styles.borderTopWidth : styles.borderWidth} ${styles.borderTopStyle ? styles.borderTopStyle : styles.borderStyle} ${styles.borderTopColor ? styles.borderTopColor : styles.borderColor}`;
    const borderBottom = `${styles.borderBottomWidth ? styles.borderBottomWidth : styles.borderWidth} ${styles.borderBottomStyle ? styles.borderBottomStyle : styles.borderStyle} ${styles.borderBottomColor ? styles.borderBottomColor : styles.borderColor}`;
    const borderLeft = `${styles.borderLeftWidth ? styles.borderLeftWidth : styles.borderWidth} ${styles.borderLeftStyle ? styles.borderLeftStyle : styles.borderStyle} ${styles.borderLeftColor ? styles.borderLeftColor : styles.borderColor}`;
    const borderRight = `${styles.borderRightWidth ? styles.borderRightWidth : styles.borderWidth} ${styles.borderRightStyle ? styles.borderRightStyle : styles.borderStyle} ${styles.borderRightColor ? styles.borderRightColor : styles.borderColor}`;
    const border = `${styles.borderWidth} ${styles.borderStyle} ${styles.borderColor}`;

    const content = cx("tab-content-holder", css`
        .ant-tabs-content-holder {
            --ant-tabs-card-bg: ${styles.background || styles.backgroundColor};
            background: ${styles.background || styles.backgroundColor} !important; // Fallback
            ${styles}
            
            border: ${border} !important;
            border-left: ${borderLeft || border};
            border-right: ${borderRight || border};
            border-bottom: ${borderBottom || border};
            padding-top: 15px !important;
            border-top-left-radius: 0px;
            border-top-right-radius: 0px;
            border-top: none !important;
        }

        .ant-tabs-tab {
            --ant-tabs-card-bg: ${cardStyles.background || cardStyles.backgroundColor};
            background: ${cardStyles.background || cardStyles.backgroundColor} !important; // Fallback
             ${cardStyles};
            border: ${borderBottom || border} !important;
             border-bottom: none !important;
        }

        .ant-tabs-tab-active {
            --ant-tabs-card-bg: ${styles.background || styles.backgroundColor};
            background: ${styles.background || styles.backgroundColor} !important; // Fallback
             ${styles};
        }

        .ant-tabs-nav {
            margin: 0;
        }

        .ant-tabs-nav::before {
            border-bottom: ${borderTop || border} !important;
        }
  `);
    return {
        content,
    };
});