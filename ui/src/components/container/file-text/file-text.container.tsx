import { AC, thunks } from '@libs/action-creators';
import { AppThunkDispatch, RootState } from '@libs/redux';
import { loadingData } from '@libs/utils';
import { CommitHash, RepoId, TreeElementOid } from '@types';
import { Spin } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { synthwave84 } from 'react-syntax-highlighter/dist/esm/styles/prism';
import styles from './file-text.module.css';
import { syntax } from './syntax';

syntax.forEach((el) => SyntaxHighlighter.registerLanguage(el.ext, el.data));

type LocationState = {
  oid: TreeElementOid;
  id:RepoId;
};

type FileTextProps = {
  fileText: string;
  commitHash: CommitHash | null;
  getFileData: (
    repoId: RepoId, oid: TreeElementOid) => (promise: () => void) => void
  killTextData: () => void
};

const FileText = ({
  fileText, commitHash, getFileData, killTextData
}: FileTextProps) => {
  const { id, oid } = useParams<'id' & 'oid'>() as LocationState;
  const [hash, ext] = oid.split('&');
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (hash && commitHash) {
      loadingData(getFileData(id, hash))
        .then(() => setIsLoading(false));
    }
    return killTextData;
  }, [commitHash]);

  return (
    <>
      {isLoading ? (
        <div className={styles.loaderWrapper}>
          <Spin />
        </div>
      )
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

const mapState = ({ repo: { fileText, tree, commitHash } }:RootState) => ({
  commitHash,
  fileText,
  tree
});

const mapDispatch = (dispatch: AppThunkDispatch) => ({
  getFileData: (
    repoId: RepoId, oid: TreeElementOid
  ) => (resolve: () => void) => {
    dispatch(thunks.getTextData(repoId, oid, resolve));
  },
  killTextData: () => {
    dispatch(AC.setFileText(''));
  }
});

export default connect(mapState, mapDispatch)(FileText);
