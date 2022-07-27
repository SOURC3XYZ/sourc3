import { ErrorBoundary, PreloadComponent } from '@components/hoc';
import {
  BackButton, FailPage, Preload, NavButton
} from '@components/shared';
import { LoadingMessages } from '@libs/constants';
import { useAllRepos } from '@libs/hooks/container/all-repos';
import { useUserRepos } from '@libs/hooks/container/user-repos';
import { message } from 'antd';
import Title from 'antd/lib/typography/Title';
import { useCallback, useMemo } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { CommitContent } from './commit-content';
import { CommitsTree } from './commit-tree';
import { ReloadBtn } from './reload-btn';
import { RepoContent } from './repo-content';
import styles from './repo.module.scss';

function UserRepos() {
  const containerProps = useUserRepos();
  const allReposProps = useAllRepos();

  const { items } = allReposProps;

  const {
    isLoaded, repoName, commitsMap, loadingHandler, startLoading, id
  } = containerProps;

  const item = items && items.filter((el) => el.repo_id === id);
  const { repo_owner } = item[0];

  const repoLink = `sourc3://${repo_owner}/${repoName}`;

  const handleCloneRepo = () => {
    navigator.clipboard.writeText(repoLink);
    message.info(`${repoLink} copied to clipboard!`);
  };

  const navigate = useNavigate();

  const goTo = (path: string) => navigate(path);

  const fallback = (props: any) => {
    const updatedProps = { ...props, subTitle: 'no data' };
    return <FailPage {...updatedProps} isBtn />;
  };

  const RefsPreloadFallback = useCallback(() => (
    <Preload
      className={styles.preload}
      message={LoadingMessages.BRANCHES}
    />
  ), []);

  const back = useCallback(() => navigate(-1), []);

  const isElectron = useMemo(() => {
    const ua = navigator.userAgent;
    return /SOURC3-DESKTOP/i.test(ua);
  }, []);

  const isLoadedReload = !!(commitsMap && isLoaded);

  return (
    <div className={styles.wrapper}>
      {isElectron ? <BackButton onClick={back} /> : null}
      <div className={styles.titleWrapper}>
        <Title className={styles.title} level={3}>{repoName}</Title>
        <NavButton
          name="Clone"
          onClick={handleCloneRepo}
          inlineStyles={{ margin: '0.5rem', width: '60px', padding: '5px' }}
          active
        />
        <ReloadBtn isLoaded={isLoadedReload} loadingHandler={startLoading} />
      </div>

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
