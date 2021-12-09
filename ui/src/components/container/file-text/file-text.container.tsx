import { thunks } from '@libs/action-creators';
import { AppThunkDispatch, RootState } from '@libs/redux';
import { RepoId, TreeElementOid } from '@types';
import { Button, Typography } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

type LocationState = {
  oid: TreeElementOid;
  id:RepoId;
};

type FileTextProps = {
  fileText: string;
  getFileData: (repoId: RepoId, oid: TreeElementOid) => void
};

const FileText = ({ fileText, getFileData }: FileTextProps) => {
  const { id, oid } = useParams<'id' & 'oid'>() as LocationState;

  const navigate = useNavigate();

  React.useEffect(() => {
    getFileData(id, oid);
  }, []);

  return (
    <>
      <Button onClick={() => navigate(-1)} type="link">Return</Button>
      <Typography.Text type="secondary">
        <pre><code>{fileText}</code></pre>
      </Typography.Text>
    </>
  );
};

const mapState = ({ repo: { fileText } }:RootState) => ({
  fileText
});

const mapDispatch = (dispatch: AppThunkDispatch) => ({
  getFileData: (repoId: RepoId, oid: TreeElementOid) => {
    dispatch(thunks.getTextData(repoId, oid));
  }
});

export default connect(mapState, mapDispatch)(FileText);
