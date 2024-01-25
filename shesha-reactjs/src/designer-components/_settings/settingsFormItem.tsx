import React, {
    cloneElement,
    FC,
    ReactElement,
    useEffect,
    useRef
    } from 'react';
import SettingsControl, { ISwitchModeSettingsRef, SettingsControlChildrenType } from './settingsControl';
import { Button, Form, FormItemProps } from 'antd';
import { ConfigurableFormItem, IConfigurableFormItemProps } from '@/components';
import { getPropertySettingsFromData } from './utils';
import { useSettingsForm } from './settingsForm';
import { useSettingsPanel } from './settingsCollapsiblePanel';
import { useStyles } from './styles/styles';

interface ISettingsFormItemProps extends Omit<IConfigurableFormItemProps, 'model'> {
    name?: string;
    label?: string;
    jsSetting?: boolean;
    readOnly?: boolean;
    disabled?: boolean;
    style?: React.CSSProperties;
    required?: boolean;
    tooltip?: string;
    hidden?: boolean;
}

const SettingsFormComponent: FC<ISettingsFormItemProps> = (props) => {
    const { styles } = useStyles();
    const { getFieldsValue } = useSettingsForm<any>();
    const formData = getFieldsValue();
    const { _mode: mode, _code: code } = getPropertySettingsFromData(formData, props.name?.toString());

    const modeRef = useRef<ISwitchModeSettingsRef>();
    const switchMode = () => {
        modeRef.current?.onChange(mode === 'code' ? 'value' : 'code');
    };

    //const [mode, setMode] = useState<PropertySettingMode>(initSettings._mode ?? 'value');
    //const switchMode = () => setMode(mode === 'code' ? 'value' : 'code');

    if (!props.name)
        return null;

    if (typeof props.children === 'function') {
        const children = props.children as SettingsControlChildrenType;
        return (
            <Form.Item {...props} label={props.label} >
                <SettingsControl id={props.name.toString()} propertyName={props.name.toString()} mode={mode}>
                    {(value, onChange, propertyName) => children(value, onChange, propertyName)}
                </SettingsControl>
            </Form.Item>
        );
    }

    if (!props.jsSetting) {
        return <Form.Item {...props as FormItemProps<any>}>{props.children}</Form.Item>;
    }

    const valuePropName = props.valuePropName ?? 'value';
    const children = props.children as ReactElement;
    return (
        <ConfigurableFormItem
            model={{
                propertyName: props.name,
                label: props.label,
                type: '',
                id: '',
                description: props.tooltip,
                validate: { required: props.required },
                hidden: props.hidden
            }}
            className='sha-js-label'
        >
            {(value, onChange) => {
                return (
                    <div className={mode === 'code' ? styles.contentCode : styles.contentJs}>
                        <Button
                            disabled={props.readOnly}
                            shape="round"
                            className={styles.jsSwitch}
                            type={'primary'}
                            danger={mode === 'value' && !!code}
                            ghost
                            size='small'
                            onClick={switchMode}
                        >
                            {mode === 'code' ? 'Value' : 'JS'}
                        </Button>

                        <div className={styles.jsContent}>
                            <SettingsControl
                                id={props.name.toString()}
                                propertyName={props.name.toString()}
                                mode={mode}
                                value={value}
                                onChange={onChange}
                                modeRef={modeRef}
                            >
                                {(value, onChange) => {
                                    return cloneElement(
                                        children,
                                        {
                                            ...children?.props,
                                            onChange: (...args: any[]) => {
                                                const event = args[0];
                                                const data = event && event.target && typeof event.target === 'object' && valuePropName in event.target
                                                    ? (event.target as HTMLInputElement)[valuePropName]
                                                    : event;
                                                onChange(data);
                                            },
                                            [valuePropName]: value
                                        });
                                }}
                            </SettingsControl>
                        </div>
                    </div>);
            }}
        </ConfigurableFormItem>
    );
};

const SettingsFormItem: FC<ISettingsFormItemProps> = (props) => {
    const settingsPanel = useSettingsPanel(false);

    useEffect(() => {
        if (settingsPanel && props.name) {
            settingsPanel.registerField(props.name.toString());
        }
    }, [settingsPanel, props.name]);

    const { propertyFilter } = useSettingsForm<any>();
    return !Boolean(propertyFilter) || typeof propertyFilter === 'function' && propertyFilter(props.name?.toString())
        ? <SettingsFormComponent {...props} />
        : null;
};

export default SettingsFormItem;