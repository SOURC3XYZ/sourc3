/* eslint-disable @typescript-eslint/no-shadow */
import {
  AllRepos,
  Manager, Notifications, Organizations, Preload, ProjectRepos, Projects, Repo
} from '@components/shared';
import { useSelector } from '@libs/redux';
import React, { useCallback, useMemo } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useUserAction } from '@libs/hooks/thunk';
import { LoadingMessages } from '@libs/constants';
import { PreloadComponent } from '@components/hoc';
import { ErrorBoundary } from '@components/context';
import ProfilesPage from '@components/shared/profiles-page/profiles-page';
import ProfilesEdit from '@components/shared/profiles-page/profiles-edit';
import Header from '../../../web/components/header/header.container';
import styles from './main.module.scss';
import { LocalRepos } from './content';

function App() {
  const { isApiConnected } = useSelector((state) => {
    const { isApiConnected, balance } = state.app;
    return { isApiConnected, balance };
  });

  const { connectToDesktopApi } = useUserAction();

  const data = [
    {
      path: '/',
      element: <Navigate replace to="/repos/all/1" />
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
      path: 'project/:projId/:type/:page',
      element: <ProjectRepos />
    },
    {
      path: 'manager',
      element: <Manager isDesk />
    },
    {
      path: 'localRepos/',
      element: <LocalRepos />
    },
    {
      path: 'profiles/:id/*',
      element: <ProfilesPage />
    },
    {
      path: 'profiles/:id/edit',
      element: <ProfilesEdit />
    }

  ];

  const routes = data.map(
    ({ path, element }) => <Route key={`route-${path}`} path={path} element={element} />
  );

  const HeadlessPreloadFallback = useCallback(() => (
    <Preload
      message={LoadingMessages.HEADLESS}
    />
  ), []);

  const main = useMemo(() => {
    const Component = isApiConnected
      ? <Routes>{routes}</Routes>
      : <Preload message="loading" />;
    return Component;
  }, [isApiConnected]);

  return (
    <PreloadComponent
      Fallback={HeadlessPreloadFallback}
      callback={connectToDesktopApi}
      isLoaded={isApiConnected}
    >
      <>
        <Header desktop />
        <div className={styles.wrapper}>
          <ErrorBoundary>
            {main}
          </ErrorBoundary>
          <Notifications />
        </div>
      </>
    </PreloadComponent>
  );
}

export default App;
