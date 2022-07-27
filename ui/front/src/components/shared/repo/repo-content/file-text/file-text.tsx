import { PreloadComponent } from '@components/hoc';
import { Preload } from '@components/shared';
import React, { useCallback } from 'react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { LoadingMessages } from '@libs/constants';
import { useFileText, FileTextProps } from '@libs/hooks/container/user-repos';
import { syntax } from './syntax';
import styles from './file-text.module.scss';

syntax.forEach((el) => SyntaxHighlighter.registerLanguage(el.ext, el.data));

function FileText(props: FileTextProps) {
  const {
    ext,
    text,
    isLoaded
  } = useFileText(props);

  const FilePreloadFallback = useCallback(() => (
    <Preload
      className={styles.preload}
      message={LoadingMessages.FILE}
    />
  ), []);

  return (
    <PreloadComponent
      isLoaded={isLoaded}
      Fallback={FilePreloadFallback}
    >
      <SyntaxHighlighter
        language={ext}
        wrapLines
        showLineNumbers
        style={vs}
        className={styles.syntax}
      >
        {text}
      </SyntaxHighlighter>
    </PreloadComponent>
  );
}

export default React.memo(FileText);
