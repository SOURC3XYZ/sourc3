import { AC, thunks } from '@libs/action-creators';
import { AppThunkDispatch, RootState } from '@libs/redux';
import {
  BranchCommit, DataNode, RepoId, TreeElementOid, UpdateProps
} from '@types';
import React from 'react';
import { batch, connect } from 'react-redux';
import {
  useParams
} from 'react-router-dom';
import { FailPage, Preload } from '@components/shared';
import { loadingData } from '@libs/utils';
import { RepoContent } from './content';

type LocationState = {
  repoParams:string;
};

type RepoProps = {
  currentId: RepoId | null;
  repoMap: Map<string, BranchCommit[]> | null;
  tree: DataNode[] | null;
  fileText: string | null;
  prevReposHref: string | null
  getRepoData: (id: RepoId) => (resolve: () => void) => void;
  updateTree: (id: RepoId) => (props: Omit<UpdateProps, 'id'>) => void;
  killTree: () => void;
  getFileData: (repoId: RepoId, oid: string) => void;
};

const UserRepos = ({
  currentId,
  repoMap,
  tree,
  fileText,
  prevReposHref,
  getRepoData,
  updateTree,
  killTree,
  getFileData
}:RepoProps) => {
  const location = useParams<'repoParams'>() as LocationState;
  const { repoParams } = location;
  const [id, repoName] = repoParams.split('&');
  const update = React.useCallback(updateTree(+id), []);
  const [isLoading, setIsLoading] = React.useState(currentId !== +id);

  React.useEffect(() => {
    if (isLoading) {
      loadingData(getRepoData(+id))
        .then(() => setIsLoading(false));
    }
  }, []);

  const repoContentProps = {
    id: +id,
    repoMap: repoMap as Map<string, BranchCommit[]>,
    tree,
    fileText,
    repoName,
    prevReposHref,
    updateTree: update,
    killTree,
    getFileData
  };
  return (
    <>
      {
        isLoading
          ? <Preload />
          : repoMap
            ? <RepoContent {...repoContentProps} />
            : <FailPage isBtn subTitle="no data" />
      }
    </>
  );
};

const mapState = ({
  repo: {
    id, repoMap, tree, fileText, prevReposHref
  }
}:RootState) => ({
  currentId: id,
  repoMap,
  tree,
  fileText,
  prevReposHref
});

const mapDispatch = (dispatch: AppThunkDispatch) => ({
  getRepoData: (id:RepoId) => (resolve: () => void) => {
    dispatch(thunks.getRepo(id, resolve));
  },
  killTree: () => {
    batch(() => {
      dispatch(AC.setFileText(null));
      dispatch(AC.setTreeData(null));
    });
  },
  updateTree: (id: RepoId) => (props: Omit<UpdateProps, 'id'>) => {
    dispatch(thunks.getTree({ ...props, id }));
  },
  getFileData: (repoId: RepoId, oid: TreeElementOid) => {
    dispatch(thunks.getTextData(repoId, oid));
  }
});

export default connect(mapState, mapDispatch)(UserRepos);
