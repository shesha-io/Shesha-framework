import { FileTextOutlined } from '@ant-design/icons';
import React from 'react';
import { IToolboxComponent } from '@/interfaces/formDesigner';
import { ITextTypographyProps } from '@/designer-components/text/models';
import TypographyComponent from '@/designer-components/text/typography';

const ParagraphComponent: IToolboxComponent<ITextTypographyProps> = {
  type: 'paragraph',
  name: 'Paragraph',
  icon: <FileTextOutlined />,
  tooltip: "Deprecated! Please use 'Text (Full)'",
  Factory: ({ model }) => <TypographyComponent {...model} />,
};

export default ParagraphComponent;
