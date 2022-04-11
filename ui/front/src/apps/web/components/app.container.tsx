import { useEffect } from 'react';
import { RootState, AppThunkDispatch } from '@libs/redux';
import { connect } from 'react-redux';
import { Route, Routes } from 'react-router-dom';
import { AC, thunks } from '@libs/action-creators';
import {
  Manager,
  Notifications,
  AllRepos,
  Preload,
  Repo
} from '@components/shared';
import { PreloadComponent } from '@components/hoc';
import styles from './app.module.scss';
import { Header, Lendos } from './content';

type MainProps = {
  connectApi: () => void,
  isApiConnected: boolean
};

const Main = ({
  isApiConnected, connectApi
}:MainProps) => {
  useEffect(() => {
    if (!isApiConnected) connectApi();
  }, [isApiConnected]);

  const routes = [
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

  const RoutesView = () => (
    <Routes>
      {
        routes
          .map(({ path, element }) => {
            const route = path === '/'
              ? element
              : (
                <PreloadComponent
                  isLoaded={isApiConnected}
                  callback={connectApi}
                  Fallback={Preload}
                >
                  {element}
                </PreloadComponent>
              );
            return <Route path={path} element={route} />;
          })
      }

    </Routes>
  );

  return (
    <>
      <Header />
      <div className={styles.main}>
        <RoutesView />
        <Notifications />
      </div>
    </>
  );
};

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
