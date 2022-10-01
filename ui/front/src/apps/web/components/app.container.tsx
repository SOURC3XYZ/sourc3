import { Route, Routes } from 'react-router-dom';
import {
  Notifications,
  Preload,
  DownloadPage
} from '@components/shared';
import { PreloadComponent } from '@components/hoc';
import { useCallback, useMemo } from 'react';
import { LoadingMessages } from '@libs/constants';
import { useWebMain } from '@libs/hooks/container/web-app';
import { ErrorBoundary } from '@components/context';
import GitAuth from '@components/shared/git-auth/gitAuth';
import { Footer } from './footer';
import styles from './app.module.scss';
import { Lendos } from './lendos';
import { Header } from './header';
import { routesData } from './routes';

function Main() {
  const { isApiConnected, isOnLending, connectBeamApi } = useWebMain();

  const HeadlessPreloadFallback = useCallback(() => (
    <Preload
      isOnLendos={isOnLending}
      message={LoadingMessages.HEADLESS}
    />
  ), [isOnLending]);

  const routes = useMemo(() => (
    <PreloadComponent
      Fallback={HeadlessPreloadFallback}
      callback={connectBeamApi}
      isLoaded={isApiConnected}
    >
      <Routes>
        {
          routesData
            .map((
              { path, element: Element }
            ) => (
              <Route
                key={`route-${path}`}
                path={path}
                element={<Element />}
              />
            ))
        }
      </Routes>

    </PreloadComponent>
  ), [isApiConnected, isOnLending]);

  return (
    <Routes>
      <Route
        path="/git-auth"
        element={<GitAuth />}
      />
      <Route
        path="/download"
        element={<DownloadPage />}
      />
      <Route
        path="/*"
        element={(

          <>
            <div className={styles.appWrapper}>
              <Header isOnLending={isOnLending} />
              <div className={styles.main}>
                <ErrorBoundary>
                  <Routes>
                    <Route path="/" element={<Lendos />} />
                    <Route path="/*" element={routes} />
                  </Routes>
                </ErrorBoundary>
                <Notifications />
              </div>
            </div>
            <Footer isOnLending={isOnLending} />
          </>
        )}
      />

    </Routes>
  );
}

export default Main;
