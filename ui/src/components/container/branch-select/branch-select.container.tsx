import { Info } from '@components/shared';
import { AC, thunks } from '@libs/action-creators';
import { AppThunkDispatch, RootState } from '@libs/redux';
import { loadingData } from '@libs/utils';
import {
  CommitHash, RepoCommit, RepoId, RepoRef
} from '@types';
import { Select } from 'antd';
import React from 'react';
import { batch, connect } from 'react-redux';

type GetRefs = (repo_id: RepoId) => (resolve: () => void) => void;

type BranchSelectProps = {
  id:RepoId;
  refs: RepoRef[];
  commitData: RepoCommit | null;
  getRefs: GetRefs
  setCommitToNull: () => void;
  getCommit: (obj_id: CommitHash, repo_id: RepoId) => void
};

const selectOptionMap = (el: RepoRef) => (
  <Select.Option
    value={el.commit_hash}
    key={el.commit_hash}
  >
    {el.name}
  </Select.Option>
);

const BranchSelect = ({
  id, refs, commitData, getRefs, setCommitToNull, getCommit
}:BranchSelectProps) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [commitHash, setHash] = React.useState<CommitHash | null>(null);
  const noRefInfo = refs.length && !commitHash;

  React.useEffect(() => {
    if (noRefInfo) setHash(refs[0].commit_hash);
  }, [refs]);

  React.useEffect(() => {
    loadingData<void>(getRefs(id))
      .then(() => setIsLoading(false));
    return setCommitToNull;
  }, [id]);

  React.useEffect(() => {
    if (commitHash) {
      setCommitToNull();
      getCommit(commitHash, id);
    }
  }, [commitHash]);

  return (
    <>
      {isLoading
        ? <Info title="loading refs..." message="" />
        : commitHash ? (
          <>
            <Select
              defaultValue={commitHash}
              size="small"
              style={{ width: 200 }}
              onChange={setHash}
            >
              { refs.map(selectOptionMap) }
            </Select>
          </>
        ) : <Info title="no commits" message="" />}

      {commitData && (
        <>
          {' '}
          <Info
            title="author: "
            message={commitData.author_name}
            link={commitData.author_email}
          />
          {' '}
          <Info
            title="last comitter: "
            message={commitData.committer_name}
            link={commitData.committer_email}
          />
        </>
      )}

    </>
  );
};

const mapState = (
  { repo: { refs, commitData } }:RootState,
  { id }: { id:RepoId }
) => ({
  id,
  refs,
  commitData
});

const mapDispatch = (dispatch:AppThunkDispatch) => ({
  getRefs: (repo_id: RepoId) => (resolve: () => void) => {
    dispatch(thunks.repoGetRefs(repo_id, resolve));
  },

  getCommit: (obj_id: CommitHash, repo_id: RepoId) => {
    dispatch(thunks.getCommit(obj_id, repo_id));
  },

  setCommitToNull: () => {
    batch(() => {
      dispatch(AC.setCommitData(null));
      dispatch(AC.setTreeData([]));
    });
  }
});

export default connect(mapState, mapDispatch)(BranchSelect);
