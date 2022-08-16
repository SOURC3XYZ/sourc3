import { PreloadComponent } from '@components/hoc';
import {
  BackButton, Preload, NavButton
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
  const { items } = useAllRepos();

  const {
    id, isLoaded, repoName, commitsMap, loadingHandler, startLoading
  } = containerProps;

  const handleCloneRepo = useCallback(() => {
    const item = items.find((el) => el.repo_id === id);
    if (item) {
      const { repo_owner } = item;
      const repoLink = `sourc3://${repo_owner}/${repoName}`;
      navigator.clipboard.writeText(repoLink);
      return message.info(`${repoLink} copied to clipboard!`);
    } return message.error(`Cannot clone repo №${id}`);
  }, [items, id]);

  const navigate = useNavigate();

  const goTo = (path: string) => navigate(path);

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

  const wrapperClass = useMemo(() => (
    isElectron ? styles.wrapperElectron : styles.wrapper), [isElectron]);

  const isLoadedReload = !!(commitsMap && isLoaded);

  return (
    <div className={wrapperClass}>
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
    </div>
  );
}

export default UserRepos;
