import { RootState, AppThunkDispatch } from '@libs/redux';
import { connect } from 'react-redux';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AC, thunks } from '@libs/action-creators';
import {
  Notifications,
  AllRepos,
  Preload,
  Repo,
  FailPage,
  Organizations,
  Projects
} from '@components/shared';
import { ErrorBoundary, PreloadComponent } from '@components/hoc';
import {
  useCallback, useLayoutEffect, useMemo
} from 'react';
import { Footer } from 'antd/lib/layout/layout';
import { LoadingMessages } from '@libs/constants';
import styles from './app.module.scss';
import { Header, Lendos } from './content';

type MainProps = {
  connectApi: () => void,
  isApiConnected: boolean
};

function Main({
  isApiConnected, connectApi
}:MainProps) {
  const { pathname } = useLocation();

  const isOnLending = pathname === '/';

  const footerClassname = isOnLending ? styles.footer : styles.footerWhiteBg;

  useLayoutEffect(() => {
    if (isOnLending) {
      document.body.style.backgroundColor = '#000';
      return;
    } document.body.style.backgroundColor = '';
  }, [isOnLending]);

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
    }
  ];

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
          .map(({ path, element }) => <Route key={`route-${path}`} path={path} element={element} />)
      }

    </Routes>
  ), [isApiConnected]);

  return (
    <PreloadComponent
      Fallback={HeadlessPreloadFallback}
      callback={connectApi}
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

const mapState = ({
  app: { isApiConnected, balance, pkey }
}: RootState) => ({
  isApiConnected,
  balance,
  pkey
});

const mapDispatch = (dispatch: AppThunkDispatch) => ({
  setInputText: (text:string) => dispatch(AC.setSearch(text)),
  connectApi: () => dispatch(thunks.connectBeamApi()),
  getWalletStatus: () => dispatch(thunks.getWalletStatus())
});

export default connect(mapState, mapDispatch)(Main);
