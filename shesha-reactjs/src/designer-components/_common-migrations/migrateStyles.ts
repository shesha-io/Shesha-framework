import { addPx } from "../_settings/utils";
import { IConfigurableFormComponent, IInputStyles, IStyleType } from "@/interfaces";

type ExtendedType = IStyleType & IConfigurableFormComponent;


export const migratePrevStyles = <T extends ExtendedType>(prev: T, defaults?: IStyleType) => {

    const migrateStyles = (screen?: 'desktop' | 'tablet' | 'mobile'): IStyleType => {
        const prevStyles: IInputStyles = screen ? prev[`${screen}`] : prev;
        const border = (side) => ({
            ...prev?.border?.border?.[side],
            width: prevStyles?.borderSize as string || prev?.border?.border?.[side]?.width || defaults?.border?.border?.[side]?.width || '1px',
            style: prevStyles?.borderType || prev?.border?.border?.[side]?.style || defaults?.border?.border?.[side]?.style || 'solid',
            color: prevStyles?.borderColor || prev?.border?.border?.[side]?.color || defaults?.border?.border?.[side]?.color || '#d9d9d9'
        });

        const heightFromSize = prevStyles?.size === 'small' ? '24px' : prevStyles?.size === 'large' ? '40px' : null;
        const fontSizeFromSize = prevStyles?.size === 'small' ? 14 : prevStyles?.size === 'large' ? 16 : null;

        return {
            size: prevStyles?.size,
            border: {
                ...prev?.border,
                hideBorder: prevStyles?.hideBorder,
                selectedCorner: 'all',
                selectedSide: 'all',
                border: {
                    ...prev?.border?.border,
                    all: border('all'),
                    top: border('top'),
                    bottom: border('bottom'),
                    left: border('left'),
                    right: border('right'),
                },
                radius: { all: prevStyles?.borderRadius || 8 },
            },
            background: {
                type: defaults?.background?.type || 'color',
                color: prevStyles?.backgroundColor || defaults?.background?.color,
                repeat: 'no-repeat',
                size: 'cover',
                position: 'center',
                gradient: { direction: 'to right', colors: {} }
            },
            font: {
                color: prevStyles?.fontColor || prev?.font?.color || '#000',
                type: prev?.font?.type || 'Segoe UI',
                align: prev?.font?.align || 'left',
                size: prevStyles?.fontSize as number || fontSizeFromSize || prev?.font?.size || 14,
                weight: prevStyles?.fontWeight as string || prev?.font?.weight || '400',
            },
            dimensions: {
                width: addPx(prevStyles?.width) || addPx(prev?.dimensions?.width) || defaults?.dimensions?.width,
                height: addPx(prevStyles?.height) || heightFromSize || addPx(prev?.dimensions?.height) || defaults?.dimensions?.height,
                minHeight: addPx(prev?.dimensions?.minHeight) || defaults?.dimensions?.minHeight,
                maxHeight: addPx(prev?.dimensions?.maxHeight) || defaults?.dimensions?.maxHeight,
                minWidth: addPx(prev?.dimensions?.minWidth) || defaults?.dimensions?.minWidth,
                maxWidth: addPx(prev?.dimensions?.maxWidth) || defaults?.dimensions?.maxWidth,
            },
            shadow: {
                offsetX: 0,
                offsetY: 0,
                color: '#000',
                blurRadius: 0,
                spreadRadius: 0
            },
            ...(defaults.position && {
                position: {
                    value: 'relative',
                    offset: 'top',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0
                }
            }),
            ...(defaults?.display && { display: defaults?.display || 'block' }),
        };
    };

    const result: T = {
        ...prev,
        desktop: { ...migrateStyles('desktop') },
        tablet: { ...migrateStyles('tablet') },
        mobile: { ...migrateStyles('mobile') },
    };

    return result;

};