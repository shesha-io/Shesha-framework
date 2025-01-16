import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, prefixCls }, { styles, colors }) => {
  const shaWizardContainer = "sha-wizard-container";
  const shaStepsContent = "sha-steps-content";
  const shaStepsButtonsContainer = "sha-steps-buttons-container";
  const shaStepsButtons = "sha-steps-buttons";

  const { primaryTextColor, secondaryTextColor, primaryBgColor, secondaryBgColor } = colors;

  console.log("COlors:::", colors);

  const shaWizard = cx("sha-wizard", css`
    
    .ant-steps-item {
      --ant-color-text-description: ${styles.color}45;
      --ant-color-text: ${styles.color};
      --ant-font-size: calc(${styles.fontSize}/1.3);
      --ant-font-size-lg: ${styles.fontSize || 16};
      --ant-steps-nav-arrow-color: ${styles.color}45;

      * {
       --ant-color-primary: ${primaryBgColor};
        font-weight: ${styles.fontWeight || 400};
        font-family: ${styles.fontFamily};
      }
    }



    .ant-btn-default {
      --ant-button-default-color: ${secondaryTextColor} !important;
      --ant-button-default-active-bg: ${secondaryBgColor} !important;
      --ant-button-default-bg: ${secondaryBgColor} !important;
      --ant-button-default-hover-border-color: ${primaryBgColor} !important;
      --ant-button-default-hover-color: ${primaryBgColor} !important;
      --ant-button-default-color: ${secondaryTextColor} !important;
  }
  .ant-btn-primary {
      --ant-button-primary-active-bg: ${primaryBgColor} !important;
      --ant-button-primary-hover-color: ${primaryTextColor} !important;
      --ant-button-primary-hover-border-color: ${secondaryBgColor} !important;
      --ant-button-default-hover-color: ${primaryBgColor} !important;
      --ant-button-primary-color: ${primaryTextColor} !important;
      --ant-button-primary-hover-bg: ${primaryBgColor}60 !important;
    }
    
    ${styles}
      
    .${shaWizardContainer} {
      margin: unset;
          
      .${shaStepsContent} {
        margin: 20px 0;
      }
  
      &.vertical {
        display: flex;
        flex-direction: row;
        margin-bottom: 20px;
  
        .${prefixCls}-steps-vertical {
          width: 150px;
        }
  
        .${shaStepsContent} {
          flex: 1;
          margin: unset;
        }
      }
    }
      
    .${shaStepsButtonsContainer} {
      display: flex;
  
      &.split {
        justify-content: space-between;
      }
  
      &.left {
        justify-content: flex-start;
      }
  
      &.right {
        justify-content: flex-end;
      }
    }
  `);
  return {
    shaWizard,
    shaWizardContainer,
    shaStepsContent,
    shaStepsButtonsContainer,
    shaStepsButtons,
  };
});