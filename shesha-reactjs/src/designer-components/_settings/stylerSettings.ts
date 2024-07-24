import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';

export const getSettings = () =>
    new DesignerToolbarSettings()
        .addCollapsiblePanel({
            id: '11114bf6-f76d-4139-a850-c99bf06c8b69',
            propertyName: 'pnlDisplay',
            parentId: 'root',
            label: 'Display',
            labelAlign: "left",
            expandIconPosition: "start",
            ghost: true,
            collapsible: 'header',
            hidden: { _code: 'return getSettingValue(data?.disabled) ?? false;', _mode: 'code', _value: false } as any,
            content: {
                id: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
                components: [...new DesignerToolbarSettings()
                    .addTextField({
                        id: '5c813b1a-04c5-4658-ac0f-cbcbae6b3bd4',
                        propertyName: 'propertyName',
                        parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
                        label: 'Property name',
                        validate: { required: true },
                    })
                    .addTextField({
                        id: 'd498779d-012a-4c6a-82a9-77231245ae28',
                        propertyName: 'label',
                        parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
                        label: 'Label',
                    })
                    .addEditMode({
                        id: '24a8be15-98eb-40f7-99ea-ebb602693e9c',
                        propertyName: 'editMode',
                        parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
                        label: "Edit mode",
                        jsSetting: true,
                    })
                    .toJson()
                ]
            }
        })
        .toJson();
