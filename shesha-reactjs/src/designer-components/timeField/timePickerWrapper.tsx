import React, { FC, useState } from 'react';
import { TimeRangePicker, TimePicker } from '@/components/antd';
import moment, { Moment, isMoment } from 'moment';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem';
import { useFormData } from '@/providers';
import { getStyle } from '@/providers/form/utils';
import { getNumericValue } from '@/utils/string';
import { TimeSteps } from '@/components/antd/timepicker';
import { useStyles } from './styles/styles';
import { ITimePickerProps, RangePickerChangeEvent, TimePickerChangeEvent } from './models';

type RangeValue = [moment.Moment, moment.Moment];

const DATE_TIME_FORMAT = 'HH:mm';

const getMoment = (value: any, dateFormat: string): Moment => {
  if (value === null || value === undefined) return undefined;
  const values = [
    isMoment(value) ? value : null,
    typeof (value) === 'number' ? moment.utc(value * 1000) : null, // time in millis
    typeof (value) === 'string' ? moment(value as string, dateFormat) : null,
    typeof (value) === 'string' ? moment(value as string) : null
  ];

  const parsed = values.find((i) => isMoment(i) && i.isValid());

  return parsed;
};

const getTotalSeconds = (value: Moment): number => {
  if (!isMoment(value) || !value.isValid())
    return undefined;

  const timeOnly = moment.duration({
    hours: value.hours(),
    minutes: value.minutes(),
    seconds: value.seconds()
  });
  return timeOnly.asSeconds();
};

export const TimePickerWrapper: FC<ITimePickerProps> = ({
  onChange,
  range,
  value,
  defaultValue,
  placeholder,
  format = DATE_TIME_FORMAT,
  readOnly,
  style,
  hourStep,
  minuteStep,
  secondStep,
  disabled,
  hideBorder,
  ...rest
}) => {
  const { data: formData } = useFormData();
  const { styles } = useStyles();

  const evaluatedValue = getMoment(value, format);
  const [asMinutes, setAsMinutes] = useState<string>();

  const hourStepLocal = getNumericValue(hourStep);
  const minuteStepLocal = getNumericValue(minuteStep);
  const secondStepLocal = getNumericValue(secondStep);


  //Should be a factors? if not shouldn't we delete the toolTips
  const steps: TimeSteps = {
    hourStep: 1 <= hourStepLocal && hourStepLocal <= 23 ? hourStepLocal as TimeSteps['hourStep'] : 1, // value should be in range 1..23
    minuteStep: 1 <= minuteStepLocal && minuteStepLocal <= 59 ? minuteStepLocal as TimeSteps['minuteStep'] : 1, // value should be in range 1..59
    secondStep: 1 <= secondStepLocal && secondStepLocal <= 59 ? secondStepLocal as TimeSteps['secondStep'] : 1, // value should be in range 1..59
  };


  const getRangePickerValues = (value: string | [string, string]) =>
    Array.isArray(value) && value?.length === 2 ? value?.map((v) => getMoment(v, format)) : [null, null];

  const handleTimePickerChange = (newValue: Moment, timeString: string) => {
    if (onChange) {
      const seconds = getTotalSeconds(newValue);
      (onChange as TimePickerChangeEvent)(seconds, timeString);
    }
  };
  const handleTimePickerSelect = (newValue: Moment) => {
    if (onChange) {
      const seconds = getTotalSeconds(newValue);
      const timeString = seconds
        ? moment(seconds * 1000).format(format)
        : undefined;
      (onChange as TimePickerChangeEvent)(seconds, timeString);
    }
  };

  const handleRangePicker = (values: Moment[], timeString: [string, string]) => {
    if (onChange) {
      const seconds = values?.map(value => getTotalSeconds(value));

      (onChange as RangePickerChangeEvent)(seconds, timeString);
    }
  };

  if (readOnly) {
    return <ReadOnlyDisplayFormItem value={evaluatedValue} disabled={disabled} type="time" timeFormat={format} />;
  }

  if (typeof defaultValue == "string" && defaultValue !== undefined) {
    setAsMinutes(defaultValue);
  }

  if (range) {
    return (
      <TimeRangePicker
        variant={hideBorder ? 'borderless' : undefined}
        onChange={handleRangePicker}
        format={format}
        value={getRangePickerValues(value || defaultValue) as RangeValue}
        {...steps}
        style={getStyle(style, formData)}
        className={styles.shaTimepicker}

        {...rest}
        placeholder={[placeholder, placeholder]}

      />
    );
  }

  return (
    <TimePicker
      variant={hideBorder ? 'borderless' : undefined}
      onChange={handleTimePickerChange}
      onSelect={handleTimePickerSelect}
      format={format}
      defaultValue={getMoment(defaultValue, format)}
      value={evaluatedValue || defaultValue && getMoment(asMinutes, format)}
      {...steps}
      style={getStyle(style, formData)}
      className={styles.shaTimepicker}
      placeholder={placeholder}
      {...rest}
    />
  );
};