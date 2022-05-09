import { PreloadComponent } from '@components/hoc';
import { Preload } from '@components/shared';
import { useAsyncError } from '@libs/hooks/shared';
import { getTree } from '@libs/utils';
import {
  DataNode, ErrorHandler, IDataNodeCustom, MetaHash, RepoId, UpdateProps
} from '@types';
import { useState, useEffect, useCallback } from 'react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { LoadingMessages } from '@libs/constants';
import { syntax } from './syntax';
import styles from './file-text.module.scss';

syntax.forEach((el) => SyntaxHighlighter.registerLanguage(el.ext, el.data));

type FileTextProps = {
  id: RepoId;
  tree: DataNode[] | null;
  pathArray: string[];
  filesMap: Map<MetaHash, string>,
  getFileData: (repoId: RepoId, oid: string, errHandler: ErrorHandler) => void;
  updateTree: (props: UpdateProps, errHandler: ErrorHandler) => void
};

function FileText({
  id, tree, filesMap, pathArray, getFileData, updateTree
}: FileTextProps) {
  const setError = useAsyncError();
  const [ext, setExt] = useState('');
  const [text, setText] = useState<string | null>(null);

  const updateTreeDecor = (props: Omit<UpdateProps, 'id'>) => {
    updateTree({ ...props, id }, setError);
  };

  const fileChecker = () => {
    const fileName = pathArray.pop();
    const currentFileList = tree && getTree(tree, pathArray, updateTreeDecor);
    if (currentFileList) {
      const file = currentFileList.find(
        (el) => el.title === fileName
      ) as IDataNodeCustom | undefined;
      if (file) {
        const memoized = filesMap.get(file.dataRef.oid);
        if (memoized) setText(memoized);
        else getFileData(id, file.dataRef.oid, setError);
      } else throw new Error('no file');
    }
    if (fileName) {
      setExt(fileName.slice(fileName.lastIndexOf('.') + 1));
    }
  };

  useEffect(fileChecker, [tree, filesMap]);

  const FilePreloadFallback = useCallback(() => (
    <Preload
      className={styles.preload}
      message={LoadingMessages.FILE}
    />
  ), []);

  return (
    <PreloadComponent
      isLoaded={text !== null}
      Fallback={FilePreloadFallback}
    >
      <SyntaxHighlighter
        language={ext}
        wrapLongLine
        showLineNumbers
        style={vs}
      >
        {text}
      </SyntaxHighlighter>
    </PreloadComponent>
  );
}

export default FileText;
