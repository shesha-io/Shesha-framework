import { IConfigurableFormComponent } from '@/providers/form/models';
import { SizeType } from 'antd/lib/config-provider/SizeContext';

export type TextType = 'text' | 'password';

export interface IInputStyles {
  size?: SizeType;
  borderSize?: number;
  borderRadius?: number;
  borderType?: string;
  borderColor?: string;
  fontColor?: string;
  fontWeight?: string | number;
  fontSize?: string | number;
  stylingBox?: string;
  height?: string;
  width?: string;
  backgroundColor?: string;
  hideBorder?: boolean;
}
export interface ITextFieldComponentProps extends IConfigurableFormComponent, IInputStyles {
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  suffixIcon?: string;
  prefixIcon?: string;
  initialValue?: string;
  passEmptyStringByDefault?: boolean;
  textType?: TextType;
}