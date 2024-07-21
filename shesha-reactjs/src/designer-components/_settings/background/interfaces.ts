import { IConfigurableFormComponent } from "@/providers";

export interface IBackgroundValue {
    type: 'color' | 'url' | 'upload' | 'base64' | 'gradient';
    gradient?: { direction: string, colors: string[] };
    color?: string;
    url?: string;
    fileId?: string;
    base64?: string;
}

export interface IBackgroundProps extends IConfigurableFormComponent {
    onChange?: (value: IBackgroundValue) => void;
    value?: IBackgroundValue;
}