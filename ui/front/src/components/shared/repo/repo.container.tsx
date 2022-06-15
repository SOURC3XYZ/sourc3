import {
  FailPage, Preload
} from '@components/shared';
import { ErrorBoundary, PreloadComponent } from '@components/hoc';
import { useUserRepos } from '@libs/hooks/container/user-repos';
import { useCallback } from 'react';
import { LoadingMessages } from '@libs/constants';
import Title from 'antd/lib/typography/Title';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { CommitContent } from './commit-content';
import { CommitsTree } from './commit-tree';
import { RepoContent } from './repo-content';

import styles from './repo.module.scss';

function UserRepos() {
  const containerProps = useUserRepos();

  const {
    isLoaded, loadingHandler, repoName
  } = containerProps;

  const navigate = useNavigate();

  const goTo = (path: string) => navigate(path);

  const fallback = (props:any) => {
    const updatedProps = { ...props, subTitle: 'no data' };
    return <FailPage {...updatedProps} isBtn />;
  };

  const RefsPreloadFallback = useCallback(() => (
    <Preload
      className={styles.preload}
      message={LoadingMessages.BRANCHES}
    />
  ), []);

  return (
    <div className={styles.wrapper}>
      <Title level={3}>{repoName}</Title>
      <ErrorBoundary fallback={fallback}>
        <PreloadComponent
          isLoaded={isLoaded}
          callback={loadingHandler}
          Fallback={RefsPreloadFallback}
        >
          <Routes>
            <Route
              path="branch/:type/:branchName/*"
              element={<RepoContent {...containerProps} goTo={goTo} />}
            />
            <Route
              path="commits/:branchName"
              element={<CommitsTree {...containerProps} goTo={goTo} />}
            />

            <Route
              path="commit/:type/:hash/*"
              element={<CommitContent {...containerProps} goTo={goTo} />}
            />
          </Routes>
        </PreloadComponent>
      </ErrorBoundary>
    </div>
  );
}

export default UserRepos;
