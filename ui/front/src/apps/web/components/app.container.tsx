import { Route, Routes } from 'react-router-dom';
import {
  Notifications,
  AllRepos,
  Preload,
  Repo,
  Organizations,
  Projects,
  ProjectRepos,
  ProfilesPage
} from '@components/shared';
import { PreloadComponent } from '@components/hoc';
import React, { useCallback, useMemo } from 'react';
import { LoadingMessages } from '@libs/constants';
import { useWebMain } from '@libs/hooks/container/web-app';
import { ErrorBoundary } from '@components/context';
import { Footer } from './footer';
import styles from './app.module.scss';
import { Lendos } from './lendos';
import { Header } from './header';
import DownloadPage from '../../../components/shared/download-page/download-page';

function Main() {
  const { isApiConnected, isOnLending, connectBeamApi } = useWebMain();

  const routesData = [
    {
      path: '/',
      element: <Lendos />
    },
    {
      path: 'repos/:type/:page',
      element: <AllRepos />
    },
    {
      path: 'repo/:repoParams/*',
      element: <Repo />
    },
    {
      path: 'organizations/:type/:page',
      element: <Organizations />
    },
    {
      path: 'projects/:orgId/:page/*',
      element: <Projects />
    },
    {
      path: 'project/:projId/:page/*',
      element: <ProjectRepos />
    },
    {
      path: 'download',
      element: <DownloadPage />
    },
    {
      path: 'profiles/:id/*',
      element: <ProfilesPage />
    }
  ];

  const HeadlessPreloadFallback = useCallback(() => (
    <Preload
      isOnLendos={isOnLending}
      message={LoadingMessages.HEADLESS}
    />
  ), []);

  const routes = useMemo(() => (
    <ErrorBoundary>
      <Routes>
        {
          routesData
            .map((
              { path, element }
            ) => <Route key={`route-${path}`} path={path} element={element} />)
        }
      </Routes>
    </ErrorBoundary>
  ), [isApiConnected]);

  return (
    <PreloadComponent
      Fallback={HeadlessPreloadFallback}
      callback={(connectBeamApi)}
      isLoaded={isApiConnected}
    >
      <>
        <div className={styles.appWrapper}>
          <Header isOnLending={isOnLending} />
          <div className={styles.main}>
            {routes}
            <Notifications />
          </div>
        </div>
        <Footer isOnLending={isOnLending} />
      </>
    </PreloadComponent>

  );
}

export default Main;
