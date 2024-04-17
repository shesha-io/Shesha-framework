import { getDataProperty, getFormatContent } from '@/utils';

export const compareValueToProperty = (key: string, value: string, properties: Array<{ [key in string]: any }>) => {
  const dataType = getDataProperty(properties, key, 'dataType');
  const dataFormat = getDataProperty(properties, key, 'dataFormat');

  return [key, getFormatContent(value, { dataType, dataFormat })];
};

export const getQuickViewInitialValues = (
  data: { [key in string]: any },
  properties: Array<{ [key in string]: any }>
) =>
  Object.entries(data || {})
    .map(([key, value]) => compareValueToProperty(key, value, properties))
    .reduce((acc, [key, value]) => ({ ...acc, ...{ [key]: value } }), {});