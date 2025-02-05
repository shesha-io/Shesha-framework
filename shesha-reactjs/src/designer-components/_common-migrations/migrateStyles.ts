import { nanoid } from "@/utils/uuid";
import { addPx } from "../_settings/utils";
import { ICommonContainerProps, IConfigurableFormComponent, IInputStyles, IStyleType } from "@/interfaces";

type ExtendedType = IInputStyles & Omit<IConfigurableFormComponent, 'type'> & { block?: boolean };


export const migratePrevStyles = <T extends ExtendedType>(prev: T, defaults?: Omit<ICommonContainerProps, 'style'>) => {

    const migrateStyles = (screen?: 'desktop' | 'tablet' | 'mobile'): IStyleType => {
        const prevStyles: IInputStyles = screen && prev[`${screen}`] ? prev[`${screen}`] : prev;

        const border = (side) => ({
            ...prev?.border?.border?.[side],
            width: prevStyles?.borderSize as string || prev?.border?.border?.[side]?.width || defaults?.border?.border?.[side]?.width || '1px',
            style: prevStyles?.borderType || prev?.border?.border?.[side]?.style || defaults?.border?.border?.[side]?.style || 'solid',
            color: prevStyles?.borderColor || prev?.border?.border?.[side]?.color || defaults?.border?.border?.[side]?.color || '#d9d9d9'
        });

        const heightFromSize = prevStyles?.size === 'small' ? '24px' : prevStyles?.size === 'large' ? '40px' : null;
        const fontSizeFromSize = prevStyles?.size === 'small' ? 14 : prevStyles?.size === 'large' ? 16 : null;
        const isColor = prevStyles.backgroundType === 'color' || prev.backgroundType === 'color';
        const isBase64 = prevStyles.backgroundDataSource === 'base64' || prev.backgroundDataSource === 'base64';
        const isUrl = prevStyles.backgroundDataSource === 'url' || prev.backgroundDataSource === 'url';
        const isStoredFile = prevStyles.backgroundDataSource === 'storedFileId' || prev.backgroundDataSource === 'storedFileId';

        const backgroundType = isColor ? 'color' : isBase64 ? 'image' : isUrl ? 'url' : isStoredFile ? 'storedFile' : 'color';
        const backgroundUrl = prevStyles.backgroundUrl || prev.backgroundUrl;
        const backgroundBase64 = prevStyles.backgroundBase64 || prev.backgroundBase64;
        const backgroundStoredFileId = prevStyles.backgroundStoredFileId || prev.backgroundStoredFileId;
        const backgroundColor = prevStyles.backgroundColor || prev.backgroundColor;
        const backgroundRepeat = prevStyles.backgroundRepeat || prev.backgroundRepeat;
        const backgroundCover = prevStyles.backgroundCover || prev.backgroundCover;

        return {
            ...defaults,
            ...prevStyles,
            size: prevStyles?.size,
            border: {
                ...prev?.border,
                hideBorder: prevStyles?.hideBorder || false,
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
                radius: {
                    all: defaults?.border?.radius?.all || 8,
                    topLeft: defaults?.border?.radius?.topLeft || 8,
                    topRight: defaults?.border?.radius?.topRight || 8,
                    bottomLeft: defaults?.border?.radius?.bottomLeft || 8,
                    bottomRight: defaults?.border?.radius?.bottomRight || 8
                },
            },
            background: {
                type: backgroundType,
                color: backgroundColor || defaults?.background?.color,
                repeat: backgroundRepeat || defaults?.background?.repeat || 'no-repeat',
                size: backgroundCover || defaults?.background?.size || 'cover',
                position: 'center',
                gradient: { direction: 'to right', colors: {} },
                url: backgroundUrl || defaults?.background?.url || '',
                storedFile: { id: backgroundStoredFileId || null },
                uploadFile: { uid: nanoid(), name: '', url: backgroundBase64 },
            },
            font: {
                color: prevStyles?.fontColor || defaults?.font?.color,
                type: prevStyles?.font?.type || defaults?.font?.type || 'Segoe UI',
                align: prevStyles?.font?.align || defaults?.font?.align || 'left',
                size: prevStyles?.fontSize as number || fontSizeFromSize || defaults?.font?.size || 14,
                weight: prevStyles?.fontWeight as string || defaults?.font?.weight || '400',
            },
            dimensions: {
                width: prev.block ? '100%' : addPx(prevStyles?.width) || addPx(prev?.dimensions?.width) || defaults?.dimensions?.width,
                height: addPx(prevStyles?.height) || heightFromSize || addPx(prev?.dimensions?.height) || defaults?.dimensions?.height,
                minHeight: addPx(prev?.dimensions?.minHeight) || defaults?.dimensions?.minHeight,
                maxHeight: addPx(prev?.dimensions?.maxHeight) || defaults?.dimensions?.maxHeight,
                minWidth: addPx(prev?.dimensions?.minWidth) || defaults?.dimensions?.minWidth,
                maxWidth: addPx(prev?.dimensions?.maxWidth) || defaults?.dimensions?.maxWidth,
            },
            shadow: {
                offsetX: defaults?.shadow?.offsetX || 0,
                offsetY: defaults?.shadow?.offsetY || 0,
                color: defaults?.shadow?.color || '#000',
                blurRadius: defaults?.shadow?.blurRadius || 0,
                spreadRadius: defaults?.shadow?.spreadRadius || 0
            },
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