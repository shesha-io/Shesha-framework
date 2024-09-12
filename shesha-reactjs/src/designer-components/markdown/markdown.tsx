import { Skeleton } from 'antd';
import React, { FC, lazy } from 'react';
import { useFormData, useGlobalState, useSubForm } from '@/providers';
import { useForm } from '@/providers/form';
import { evaluateString, getStyle } from '@/providers/form/utils';
import { IMarkdownProps } from './interfaces';
import './styles.module.scss'; // This manually loads github-markdown-css, as per https://raw.githubusercontent.com/sindresorhus/github-markdown-css/gh-pages/github-markdown.css
import ConfigError from '@/components/configError';

let SyntaxHighlighter;
let dark;
let remarkGfm;

const ReactMarkdown = lazy(async () => {
  import('remark-gfm').then(module => {
    remarkGfm = module?.default;
  });

  import('react-syntax-highlighter').then(module => {
    SyntaxHighlighter = module?.Prism;
  });

  import('react-syntax-highlighter/dist/esm/styles/prism').then(module => {
    dark = module?.dark;
  });

  return import('react-markdown');
});

const Markdown: FC<IMarkdownProps> = model => {
  const { formMode } = useForm();
  // NOTE: to be replaced with a generic context implementation
  const { value: subFormData } = useSubForm(false) ?? {};
  const { data: formData } = useFormData();
  const { globalState } = useGlobalState();

  const data = subFormData || formData;

  const content = evaluateString(model?.content, { data, globalState });

  if (!content && formMode === 'designer') {
    return <ConfigError type='markdown' errorMessage="Please make sure you enter the content to be displayed here!" comoponentId={model?.id} />;
  }

  const isSSR = typeof window === 'undefined';

  return isSSR ? (
    <Skeleton loading={true} />
  ) : (
    <React.Suspense fallback={<div>Loading editor...</div>}>
      <div className="markdown-body" style={getStyle(model?.style, { data, globalState })}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]?.filter(Boolean)}
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match && SyntaxHighlighter ? (
                <SyntaxHighlighter
                  children={String(children).replace(/\n$/, '')}
                  style={dark}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                />
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </React.Suspense>
  );
};

Markdown.displayName = 'Markdown';

export { Markdown };
export default Markdown;
