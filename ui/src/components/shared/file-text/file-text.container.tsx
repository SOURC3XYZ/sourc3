import { Preload } from '@components/shared';
import { BranchCommit, RepoId, TreeElementOid } from '@types';
import React from 'react';
import { useParams } from 'react-router-dom';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { synthwave84 } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { syntax } from './syntax';

syntax.forEach((el) => SyntaxHighlighter.registerLanguage(el.ext, el.data));

type LocationState = {
  oid: TreeElementOid;
  id:RepoId;
  commit: BranchCommit
};

type FileTextProps = {
  fileText: string | null;
  getFileData: (repoId: RepoId, oid: string) => void;
};

const FileText = ({
  fileText, getFileData
}: FileTextProps) => {
  const { id, oid } = useParams<'id' & 'oid'>() as LocationState;
  const [hash, ext] = oid.split('&');

  React.useEffect(() => {
    if (fileText === null)getFileData(id, hash);
  });

  return (
    <>
      {fileText === null ? <Preload />
        : (
          <SyntaxHighlighter
            language={ext || ''}
            wrapLongLine
            showLineNumbers
            style={synthwave84}
          >
            {fileText}
          </SyntaxHighlighter>
        )}
    </>
  );
};

export default FileText;
