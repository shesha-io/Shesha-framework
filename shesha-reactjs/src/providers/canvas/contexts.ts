import { createNamedContext } from '@/utils/react';

export type IDeviceTypes = 'desktop' | 'mobile' | 'tablet' | 'custom';

export interface ICanvasStateContext {
  zoom?: number;
  designerWidth?: string;
  designerDevice?: IDeviceTypes;
  physicalDevice?: IDeviceTypes;
  activeDevice?: IDeviceTypes;
}

export interface ICanvasWidthProps {
  width: number | string;
  deviceType: string;
}
export interface ICanvasActionsContext {
  setDesignerDevice: (deviceType: IDeviceTypes) => void;
  setCanvasWidth: (width: number | string, deviceType: IDeviceTypes) => void;
  setCanvasZoom: (zoom: number) => void;
  /* NEW_ACTION_ACTION_DECLARATION_GOES_HERE */
}

export const CANVAS_CONTEXT_INITIAL_STATE: ICanvasStateContext = {
  zoom: 100,
  designerDevice: 'desktop',
};

export const CanvasStateContext = createNamedContext<ICanvasStateContext>(CANVAS_CONTEXT_INITIAL_STATE, "CanvasConfigStateContext");

export const CanvasActionsContext = createNamedContext<ICanvasActionsContext>(undefined, "CanvasConfigActionsContext");

//#endregion
