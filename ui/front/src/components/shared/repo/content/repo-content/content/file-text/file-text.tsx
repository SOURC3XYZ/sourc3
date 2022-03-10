import { Preload } from '@components/shared';
import { getTree } from '@libs/utils';
import {
  DataNode, IDataNodeCustom, RepoId, UpdateProps
} from '@types';
import React from 'react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { synthwave84 } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { syntax } from './syntax';

syntax.forEach((el) => SyntaxHighlighter.registerLanguage(el.ext, el.data));

type FileTextProps = {
  id: RepoId;
  fileText: string | null;
  tree: DataNode[] | null;
  pathArray: string[];
  getFileData: (repoId: RepoId, oid: string) => void;
  updateTree: (props: UpdateProps) => void
};

const FileText = ({
  id, tree, fileText, pathArray, getFileData, updateTree
}: FileTextProps) => {
  const [ext, setExt] = React.useState('');

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
      if (file) getFileData(id, file.dataRef.oid);
      else throw new Error('no file');
    }
    if (fileName) {
      setExt(fileName.slice(fileName.lastIndexOf('.') + 1));
    }
  };

  React.useEffect(fileChecker, [tree]);

  return (
    <>
      {fileText === null
        ? <Preload />
        : (
          <SyntaxHighlighter
            language={ext}
            wrapLongLine
            showLineNumbers
            style={synthwave84}
          >
            {fileText}
          </SyntaxHighlighter>
        ) }
    </>
  );
};

export default FileText;
