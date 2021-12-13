import { AC, thunks } from '@libs/action-creators';
import { AppThunkDispatch, RootState } from '@libs/redux';
import {
  CommitHash, RepoId, RepoRef
} from '@types';
import { Select, Typography } from 'antd';
import React from 'react';
import { batch, connect } from 'react-redux';

type BranchSelectProps = {
  id:RepoId;
  refs: RepoRef[];
  getRefs: (repo_id: RepoId) => void;
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
  id, refs, getRefs, setCommitToNull, getCommit
}:BranchSelectProps) => {
  const [commitHash, setHash] = React.useState<CommitHash | null>(null);

  React.useEffect(() => {
    if (refs.length && !commitHash) setHash(refs[0].commit_hash);
  }, [refs]);

  React.useEffect(() => {
    getRefs(id);
  }, [id]);

  React.useEffect(() => {
    if (commitHash) {
      setCommitToNull();
      getCommit(commitHash, id);
    }
  }, [commitHash]);

  return (
    <>
      {commitHash ? (
        <Select
          defaultValue={commitHash}
          size="small"
          style={{ width: 200 }}
          onChange={setHash}
        >
          { refs.map(selectOptionMap) }
        </Select>
      ) : <Typography.Text>no commits</Typography.Text>}
    </>
  );
};

const mapState = (
  { repo: { refs } }:RootState,
  { id }: { id:RepoId }
) => ({
  id,
  refs
});

const mapDispatch = (dispatch:AppThunkDispatch) => ({
  getRefs: (repo_id: RepoId) => {
    dispatch(thunks.repoGetRefs(repo_id));
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
