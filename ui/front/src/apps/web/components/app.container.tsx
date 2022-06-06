import { Route, Routes } from 'react-router-dom';
import {
  Notifications,
  AllRepos,
  Preload,
  Repo,
  FailPage,
  Organizations,
  Projects,
  ProjectRepos
} from '@components/shared';
import { ErrorBoundary, PreloadComponent } from '@components/hoc';
import {
  useCallback, useMemo
} from 'react';
import { Footer } from 'antd/lib/layout/layout';
import { LoadingMessages } from '@libs/constants';
import { useWebMain } from '@libs/hooks/container/web-app';
import styles from './app.module.scss';
import { Lendos } from './lendos';
import { Header } from './header';

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
      path: 'projects/:orgId/:type/:page',
      element: <Projects />
    },
    {
      path: 'project/:projId/:type/:page',
      element: <ProjectRepos />
    }
  ];

  const footerClassname = isOnLending ? styles.footer : styles.footerWhiteBg;

  const fallback = (props:any) => {
    const updatedProps = { ...props, subTitle: props.message || 'no data' };
    return <FailPage {...updatedProps} isBtn />;
  };

  const HeadlessPreloadFallback = useCallback(() => (
    <Preload
      isOnLendos={isOnLending}
      message={LoadingMessages.HEADLESS}
    />
  ), []);

  const routes = useMemo(() => (
    <Routes>
      {
        routesData
          .map((
            { path, element }
          ) => <Route key={`route-${path}`} path={path} element={element} />)
      }
    </Routes>
  ), [isApiConnected]);

  return (
    <PreloadComponent
      Fallback={HeadlessPreloadFallback}
      callback={connectBeamApi}
      isLoaded={isApiConnected}
    >
      <ErrorBoundary fallback={fallback}>
        <>
          <div className={styles.appWrapper}>
            <Header isOnLending={isOnLending} />
            <div className={styles.main}>
              {routes}
              <Notifications />
            </div>
          </div>
          <Footer className={footerClassname}>
            © 2022 by SOURC3
          </Footer>
        </>
      </ErrorBoundary>

    </PreloadComponent>

  );
}

export default Main;
