import { TreeList } from '@components/shared';
import { AC, thunks } from '@libs/action-creators';
import {
  AppThunkDispatch, RootState
} from '@libs/redux';
import {
  CommitHash,
  RepoCommit, RepoId, RepoRef, TreeElementOid, UpdateProps
} from '@types';
import { Button, Select, Typography } from 'antd';
import { DataNode } from 'antd/lib/tree';
import React from 'react';
import { batch, connect } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

type LocationState = {
  id:RepoId;
};

type TreeProps = {
  refs: RepoRef[];
  commitData: RepoCommit | null;
  tree: DataNode[];
  setCommitToNull: () => void;
  repoGetRefs: (id: number) => void;
  getCommit: (obj_id: CommitHash, id: RepoId) => void;
  updateTree: (props: UpdateProps) => void;
};

const Repo = ({
  refs, commitData, tree, setCommitToNull, repoGetRefs, getCommit, updateTree
}:TreeProps) => {
  const location = useParams<'id' & 'oid'>() as LocationState;
  const { id } = location;
  const [commitHash, setHash] = React.useState<CommitHash | null>(null);

  React.useEffect(() => {
    if (refs.length && !commitHash) setHash(refs[0].commit_hash);
  }, [refs]);

  React.useEffect(() => {
    repoGetRefs(id);
  }, []);

  React.useEffect(() => {
    if (commitHash) {
      setCommitToNull();
      getCommit(commitHash, id);
    }
  }, [commitHash]);

  const navigate = useNavigate();

  const children = refs.map(
    (el) => (
      <Select.Option
        value={el.commit_hash}
        key={el.commit_hash}
      >
        {el.name}
      </Select.Option>
    )
  );

  return (
    <>
      <Button onClick={() => navigate(-1)} type="link">Return</Button>
      {children.length ? (
        <>
          <Select
            defaultValue={refs[0].name}
            size="small"
            style={{ width: 200 }}
            onChange={(value: CommitHash) => setHash(value)}
          >
            {children}
          </Select>
          {commitData
            && (
              <TreeList
                repoId={id}
                commitData={commitData}
                tree={tree}
                getTree={updateTree}
              />
            )}

        </>
      ) : <Typography.Text type="secondary">no commits</Typography.Text>}

    </>
  );
};

const mapState = (
  { repo: { refs, commitData, tree } }:RootState
) => ({
  refs,
  tree,
  commitData
});

const mapDispatch = (dispatch:AppThunkDispatch) => ({

  repoGetRefs: (repo_id: RepoId) => {
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
  },

  getFileData: (repoId: RepoId, oid: TreeElementOid) => {
    dispatch(thunks.getTextData(repoId, oid));
  },

  updateTree: (props: UpdateProps) => {
    dispatch(thunks.getTree(props));
  }
});

export default connect(mapState, mapDispatch)(Repo);
