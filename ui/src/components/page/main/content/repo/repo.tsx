import { AC, thunks } from '@libs/action-creators';
import { AppThunkDispatch, RootState } from '@libs/redux';
import {
  BranchCommit, DataNode, RepoId, TreeElementOid, UpdateProps
} from '@types';
import React from 'react';
import { batch, connect } from 'react-redux';
import {
  Route, Routes, useParams
} from 'react-router-dom';
import { FileText, FileTree, Preload } from '@components/shared';
import UpperMenu from './upper-menu';

type LocationState = {
  id:string;
};

type RepoProps = {
  currentId: RepoId | null;
  repoMap: Map<string, BranchCommit[]> | null;
  tree: DataNode[] | null;
  fileText: string | null;
  getRepoData: (id: RepoId) => void;
  updateTree: (id: RepoId) => (props: Omit<UpdateProps, 'id'>) => void;
  killTree: () => void;
  getFileData: (repoId: RepoId, oid: string) => void;
};

const UserRepos = ({
  currentId,
  repoMap,
  tree,
  fileText,
  getRepoData,
  updateTree,
  killTree,
  getFileData
}:RepoProps) => {
  const location = useParams<'id' & 'oid'>() as LocationState;
  const { id } = location;
  const [numId, repoName] = id.split('&');
  const update = React.useCallback(updateTree(+numId), []);
  const isLoaded = repoMap && currentId === +numId;

  React.useEffect(() => {
    if (currentId !== +numId) {
      getRepoData(+numId);
    }
  }, []);
  return (
    <>
      {
        isLoaded
          ? (
            <>
              <UpperMenu
                repoMap={repoMap}
                repoName={repoName}
                updateTree={update}
                killTree={killTree}
              />

              <Routes>
                <Route
                  path="tree"
                  element={(
                    <FileTree
                      id={+numId}
                      tree={tree}
                      updateTree={update}
                    />
                  )}
                />

                <Route
                  path=":oid"
                  element={(
                    <FileText
                      fileText={fileText}
                      getFileData={getFileData}
                    />
                  )}
                />
              </Routes>
            </>
          ) : <Preload />

      }
    </>
  );
};

const mapState = ({
  repo: {
    id, repoMap, tree, fileText
  }
}:RootState) => ({
  currentId: id,
  repoMap,
  tree,
  fileText
});

const mapDispatch = (dispatch: AppThunkDispatch) => ({
  getRepoData: (id:RepoId) => {
    dispatch(thunks.getRepo(id));
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
