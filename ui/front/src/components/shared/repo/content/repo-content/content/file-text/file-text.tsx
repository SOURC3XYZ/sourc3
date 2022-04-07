import { Preload } from '@components/shared';
import { getTree } from '@libs/utils';
import {
  DataNode, IDataNodeCustom, MetaHash, RepoId, UpdateProps
} from '@types';
import { useState, useEffect } from 'react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { syntax } from './syntax';

syntax.forEach((el) => SyntaxHighlighter.registerLanguage(el.ext, el.data));

type FileTextProps = {
  id: RepoId;
  tree: DataNode[] | null;
  pathArray: string[];
  filesMap: Map<MetaHash, string>,
  getFileData: (repoId: RepoId, oid: string) => void;
  updateTree: (props: UpdateProps) => void
};

const FileText = ({
  id, tree, filesMap, pathArray, getFileData, updateTree
}: FileTextProps) => {
  const [ext, setExt] = useState('');
  const [text, setText] = useState<string | null>(null);

  const updateTreeDecor = (props: Omit<UpdateProps, 'id'>) => {
    updateTree({ ...props, id });
  };

  const fileChecker = () => {
    const fileName = pathArray.pop();
    const currentFileList = tree && getTree(
      tree, pathArray, updateTreeDecor
    );
    if (currentFileList) {
      const file = currentFileList.find(
        (el) => el.title === fileName
      ) as IDataNodeCustom | undefined;
      if (file) {
        const memoized = filesMap.get(file.dataRef.oid);
        if (memoized) setText(memoized);
        else getFileData(id, file.dataRef.oid);
      } else throw new Error('no file');
    }
    if (fileName) {
      setExt(fileName.slice(fileName.lastIndexOf('.') + 1));
    }
  };

  useEffect(fileChecker, [tree, filesMap]);

  return (
    <>
      {text === null
        ? <Preload />
        : (
          <SyntaxHighlighter
            language={ext}
            wrapLongLine
            showLineNumbers
            style={vs}
          >
            {text}
          </SyntaxHighlighter>
        ) }
    </>
  );
};

export default FileText;
