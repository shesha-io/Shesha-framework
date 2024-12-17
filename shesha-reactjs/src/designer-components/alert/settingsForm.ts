import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { IAlertComponentProps } from './interfaces';
import { nanoid } from '@/utils/uuid';
import { FormLayout } from 'antd/es/form/Form';

export const getSettings = (data: IAlertComponentProps) => {
  const commonTabId = nanoid();
  const appearanceTabId = nanoid();
  const securityTabId = nanoid();

  return {

    components: new DesignerToolbarSettings(data)
      .addSearchableTabs({
        id: nanoid(),
        propertyName: 'settingsTabs',
        parentId: 'root',
        label: 'Settings',
        hideLabel: true,
        labelAlign: 'right',
        size: 'small',
        tabs: [
          {
            key: 'common',
            title: 'Common',
            id: commonTabId,
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: commonTabId,
                  inputs: [
                    {
                      type: 'text',
                      id: nanoid(),
                      propertyName: 'componentName',
                      label: 'Component name',
                      size: 'small',
                      jsSetting: true,
                    }
                  ],
                  readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: commonTabId,
                  inputs: [
                    {
                      type: 'dropdown',
                      id: nanoid(),
                      propertyName: 'alertType',
                      label: 'Type',
                      size: 'small',
                      jsSetting: true,
                      dropdownOptions: [
                        { label: 'Success', value: 'success' },
                        { label: 'Info', value: 'info' },
                        { label: 'Warning', value: 'warning' },
                        { label: 'Error', value: 'error' }
                      ]
                    }
                  ],
                  readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: commonTabId,
                  inputs: [
                    {
                      type: 'textArea',
                      id: nanoid(),
                      propertyName: 'text',
                      label: 'Message',
                      size: 'small',
                      tooltip: 'The message to display in the alert. You can use variables and expressions.', 
                      allowClear: true,
                      jsSetting: true,
                    }
                  ],
                  readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: commonTabId,
                  inputs: [
                    {
                      type: 'textArea',
                      id: nanoid(),
                      propertyName: 'description',
                      label: 'Description',
                      tooltip: 'Additional information about the alert.',
                      jsSetting: true,
                    }
                  ],
                  readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,                      
                  hidden: { _code: 'return getSettingValue(data?.readOnly) || getSettingValue(data?.banner);', _mode: 'code', _value: true } as any,

                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: commonTabId,
                  inputs: [
                    {
                      type: 'switch',
                      id: nanoid(),
                      propertyName: 'showIcon',
                      label: 'Show icon',
                      size: 'small',
                      jsSetting: true,
                    },
                    {
                      type: 'iconPicker',
                      id: nanoid(),
                      propertyName: 'icon',
                      label: 'Icon',
                      size: 'small',
                    }
                  ],
                  readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: commonTabId,
                  inputs: [
                    {
                      type: 'switch',
                      id: nanoid(),
                      propertyName: 'marquee',
                      label: 'Marquee',
                      size: 'small',
                      tooltip: 'If enabled, the content will scroll horizontally.',
                      jsSetting: true,
                    },
                    {
                      type: 'switch',
                      id: nanoid(),
                      propertyName: 'banner',
                      label: 'banner',
                      size: 'small',
                      tooltip: 'If enabled, the alert will be displayed as a banner.',
                      jsSetting: true,
                    },
                  ],
                  readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: commonTabId,
                  inputs: [
                    {
                      type: 'switch',
                      id: nanoid(),
                      propertyName: 'closable',
                      label: 'Closable',
                      size: 'small',
                      jsSetting: true,
                    }
                  ],
                  readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                })
                .toJson()]
          },
          {
            key: 'appearance',
            title: 'Appearance',
            id: appearanceTabId,
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: appearanceTabId,
                  inputs: [
                    {
                      type: 'switch',
                      id: nanoid(),
                      propertyName: 'hidden',
                      label: 'Hidden',
                      size: 'small',
                      jsSetting: true,
                    }
                  ],
                  readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                })  
                .addCollapsiblePanel({
                  id: nanoid(),
                  propertyName: 'customStyle',
                  label: 'Custom Style',
                  labelAlign: 'right',
                  ghost: true,
                  parentId: appearanceTabId,
                  collapsible: 'header',
                  content: {
                    id: nanoid(),
                    components: [...new DesignerToolbarSettings()
                      .addSettingsInput({
                        readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                        id: nanoid(),
                        inputType: 'codeEditor',
                        propertyName: 'style',
                        hideLabel: true,
                        label: 'Style',
                        description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
                      })
                      .toJson()
                    ]
                  }
                })

                .toJson()
            ]
          },
          {
            key: 'security',
            title: 'Security',
            id: securityTabId,
            components: [...new DesignerToolbarSettings()
              .addSettingsInput({
                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                id: nanoid(),
                inputType: 'permissions',
                propertyName: 'permissions',
                label: 'Permissions',
                size: 'small',
                parentId: securityTabId
              })
              .toJson()
            ]
          }
        ]
      }).toJson(),
    formSettings: {
      colon: false,
      layout: 'vertical' as FormLayout,
      labelCol: { span: 24 },
      wrapperCol: { span: 24 }
    }
  };
};



