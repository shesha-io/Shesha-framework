import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, prefixCls }) => {
  const shaWizardContainer = "sha-wizard-container";
  const shaStepsContent = "sha-steps-content";
  const shaStepsButtonsContainer = "sha-steps-buttons-container";
  const shaStepsButtons = "sha-steps-buttons";
  const customFooter = "custom-footer";
  const shaWizard = cx("sha-wizard", css`
        .${customFooter} {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          
        }
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
    customFooter
  };
});