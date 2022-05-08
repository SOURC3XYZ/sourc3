import { RootState, AppThunkDispatch } from '@libs/redux';
import { connect } from 'react-redux';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AC, thunks } from '@libs/action-creators';
import {
  Manager,
  Notifications,
  AllRepos,
  Preload,
  Repo,
  FailPage
} from '@components/shared';
import { ErrorBoundary, PreloadComponent } from '@components/hoc';
import {
  useCallback, useEffect, useLayoutEffect, useMemo
} from 'react';
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

  useEffect(() => {
    connectApi();
  }, []);

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
      path: 'manager',
      element: <Manager />
    }
  ];

  const fallback = (props:any) => {
    const updatedProps = { ...props, subTitle: props.message || 'no data' };
    return <FailPage {...updatedProps} isBtn />;
  };

  const routes = useMemo(() => (
    <Routes>
      {
        routesData
          .map(({ path, element }) => {
            const route = path === '/'
              ? element
              : (
                <PreloadComponent
                  isLoaded={isApiConnected}
                  Fallback={Preload}
                >
                  <ErrorBoundary fallback={fallback}>
                    {element}
                  </ErrorBoundary>
                </PreloadComponent>
              );
            return <Route key={`route-${path}`} path={path} element={route} />;
          })
      }

    </Routes>
  ), [isApiConnected]);

  return (
    <div className={styles.appWrapper}>
      <Header isOnLending={isOnLending} />
      <div className={styles.main}>
        {routes}
        <Notifications />
      </div>
    </div>
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
