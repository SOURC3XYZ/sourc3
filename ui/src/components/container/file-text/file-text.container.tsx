import { AC, thunks } from '@libs/action-creators';
import { AppThunkDispatch, RootState } from '@libs/redux';
import { RepoId, TreeElementOid } from '@types';
import React from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

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

  React.useEffect(() => {
    getFileData(id, oid);
    return () => killTextData();
  }, []);

  return (
    <>
      <SyntaxHighlighter style={docco}>
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
