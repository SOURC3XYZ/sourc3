import { AC, thunks } from '@libs/action-creators';
import { AppThunkDispatch, RootState } from '@libs/redux';
import { RepoId, TreeElementOid } from '@types';
import React from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { syntax } from './syntax';

syntax.forEach((el) => SyntaxHighlighter.registerLanguage(el.ext, el.data));

type LocationState = {
  oid: TreeElementOid;
  id:RepoId;
};

type FileTextProps = {
  fileText: string;
  getFileData: (repoId: RepoId, oid: TreeElementOid) => void
  killTextData: () => void
};

const FileText = ({ fileText, getFileData, killTextData }: FileTextProps) => {
  const { id, oid } = useParams<'id' & 'oid'>() as LocationState;
  const [hash, ext] = oid.split('&');
  React.useEffect(() => {
    if (hash) {
      getFileData(id, hash);
    }
    return () => killTextData();
  }, []);

  return (
    <>
      <SyntaxHighlighter
        language={ext || ''}
        wrapLongLine
        showLineNumbers
        style={prism}
      >
        {fileText}
      </SyntaxHighlighter>
    </>
  );
};

const mapState = ({ repo: { fileText } }:RootState) => ({
  fileText
});

const mapDispatch = (dispatch: AppThunkDispatch) => ({
  getFileData: (repoId: RepoId, oid: TreeElementOid) => {
    dispatch(thunks.getTextData(repoId, oid));
  },
  killTextData: () => {
    dispatch(AC.setFileText(''));
  }
});

export default connect(mapState, mapDispatch)(FileText);
