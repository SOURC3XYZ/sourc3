import { AC, thunks } from '@libs/action-creators';
import { AppThunkDispatch, RootState } from '@libs/redux';
import {
  BranchCommit, DataNode, ErrorHandler, MetaHash, RepoId, TreeElementOid, UpdateProps
} from '@types';
import { batch, connect } from 'react-redux';
import { FailPage, Preload } from '@components/shared';
import { ErrorBoundary, PreloadComponent } from '@components/hoc';
import { useUserRepos } from '@libs/hooks/container/user-repos';
import { useCallback } from 'react';
import { LoadingMessages } from '@libs/constants';
import Title from 'antd/lib/typography/Title';
import { RepoContent } from './content';
import styles from './repo.module.scss';

type RepoProps = {
  currentId: RepoId | null;
  repoMap: Map<string, BranchCommit[]> | null;
  filesMap: Map<MetaHash, string>;
  tree: DataNode[] | null;
  fileText: string | null;
  prevReposHref: string | null
  getRepoData: (
    id: RepoId, errHandler: ErrorHandler
  ) => (resolve: () => void) => void;
  updateTree: (
    id: RepoId, errHandler: ErrorHandler
  ) => (props: Omit<UpdateProps, 'id'>) => void;
  killTree: () => void;
  getFileData: (
    repoId: RepoId, oid: string, errHandler: ErrorHandler
  ) => void;
};

function UserRepos({
  currentId,
  repoMap,
  filesMap,
  tree,
  prevReposHref,
  getRepoData,
  updateTree,
  killTree,
  getFileData
}:RepoProps) {
  const talonProps = useUserRepos({ currentId, getRepoData, updateTree });

  const { isLoaded, loadingHandler, repoName } = talonProps;

  const fallback = (props:any) => {
    const updatedProps = { ...props, subTitle: 'no data' };
    return <FailPage {...updatedProps} isBtn />;
  };

  const RefsPreloadFallback = useCallback(() => (
    <Preload
      className={styles.preload}
      message={LoadingMessages.COMMITS}
    />
  ), []);

  const props = {
    ...talonProps,
    repoMap: repoMap as NonNullable<typeof repoMap>,
    tree,
    filesMap,
    prevReposHref,
    killTree,
    getFileData
  };

  return (
    <div className={styles.wrapper}>
      <Title level={3}>{repoName}</Title>
      <ErrorBoundary fallback={fallback}>
        <PreloadComponent
          isLoaded={isLoaded}
          callback={loadingHandler}
          Fallback={RefsPreloadFallback}
        >
          <RepoContent {...props} />
        </PreloadComponent>
      </ErrorBoundary>
    </div>
  );
}

const mapState = ({
  repo: {
    id, repoMap, filesMap, tree, fileText, prevReposHref
  }
}:RootState) => ({
  currentId: id,
  repoMap,
  filesMap,
  tree,
  fileText,
  prevReposHref
});

const mapDispatch = (dispatch: AppThunkDispatch) => ({
  getRepoData: (id:RepoId, errHandler: ErrorHandler) => (resolve: () => void) => {
    dispatch(thunks.getRepo(id, errHandler, resolve));
  },
  killTree: () => {
    batch(() => {
      dispatch(AC.setFileText(null));
      dispatch(AC.setTreeData(null));
    });
  },
  updateTree: (id: RepoId, errHandler: ErrorHandler) => (props: Omit<UpdateProps, 'id'>) => {
    dispatch(thunks.getTree({ ...props, id }, errHandler));
  },
  getFileData: (repoId: RepoId, oid: TreeElementOid, errHandler: ErrorHandler) => {
    dispatch(thunks.getTextData(repoId, oid, errHandler));
  }
});

export default connect(mapState, mapDispatch)(UserRepos);
