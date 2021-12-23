import { Info } from '@components/shared';
import { AC, thunks } from '@libs/action-creators';
import { AppThunkDispatch, RootState } from '@libs/redux';
import { logger } from '@libs/utils';
import {
  CommitHash, RepoId, RepoRef
} from '@types';
import { Select } from 'antd';
import React from 'react';
import { batch, connect } from 'react-redux';

type GetRefs = (repo_id: RepoId) => void;

type BranchSelectProps = {
  id:RepoId;
  refs: RepoRef[];
  commitHash: CommitHash | null;
  killRef: () => void;
  getRefs: GetRefs
  getCommit: (repo_id: RepoId) => (obj_id: CommitHash) => void
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
  id, refs, commitHash, getCommit, getRefs, killRef
}:BranchSelectProps) => {
  React.useEffect(() => {
    getRefs(id);
    return killRef;
  }, []);

  logger('Branch select', [
    ['id', id],
    ['hash', commitHash],
    ['refs', refs]
  ]);
  return (
    <>
      {!commitHash
        ? <Info title="loading refs..." message="" />
        : refs.length ? (
          <>
            <Select
              defaultValue={commitHash}
              size="small"
              style={{ width: 200 }}
              onChange={getCommit(id)}
            >
              { refs.map(selectOptionMap) }
            </Select>
          </>
        ) : <Info title="no commits" message="" />}
    </>
  );
};

const mapState = (
  { repo: { refs, commitHash } }:RootState
) => ({
  refs,
  commitHash
});

const mapDispatch = (dispatch:AppThunkDispatch) => ({
  getRefs: (repo_id: RepoId) => {
    dispatch(thunks.repoGetRefs(repo_id));
  },

  getCommit: (repo_id: RepoId) => (obj_id: CommitHash) => {
    dispatch(thunks.getCommit(obj_id, repo_id));
  },

  killRef: () => {
    console.log('kill refs');
    batch(() => {
      dispatch(AC.setRepoRefs([]));
      dispatch(AC.setCommitData(null));
      dispatch(AC.setTreeData([]));
      dispatch(AC.setCommitHash(null));
    });
  }
});

export default connect(mapState, mapDispatch)(BranchSelect);
