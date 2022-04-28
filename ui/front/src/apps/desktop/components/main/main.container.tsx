import {
  AllRepos,
  Header,
  Manager, Notifications, Preload, Repo
} from '@components/shared';
import NavMenu from '@components/shared/menu/menu';
import { thunks } from '@libs/action-creators';
import { AppThunkDispatch, RootState } from '@libs/redux';
import React, { useMemo } from 'react';
import { connect } from 'react-redux';
import { Navigate, Route, Routes } from 'react-router-dom';
import { CONTRACT } from '@libs/constants';
import styles from './main.module.scss';
import { LocalRepos } from './content';

type MainDeskProps = {
  connectApi: (host:string) => void,
  isApiConnected: boolean,
  balance: number,
  pkey: string
};

const beamHost = `${CONTRACT.HOST}/beam`;

function App({
  isApiConnected, connectApi, balance, pkey
}: MainDeskProps) {
  React.useEffect(() => {
    if (!isApiConnected) connectApi(beamHost);
  }, []);

  const data = [
    {
      path: '/',
      element: <Navigate replace to="repos/all/1" />
    },
    {
      path: 'repos/:type/:page',
      element: <AllRepos />
    },
    {
      path: '/repo/:repoParams/*',
      element: <Repo />
    },
    {
      path: 'manager',
      element: <Manager isDesk />
    },
    {
      path: '/localRepos',
      element: <LocalRepos />
    }
  ];

  const routes = data.map(
    ({ path, element }) => <Route path={path} element={element} />
  );

  const View = useMemo(() => {
    const Component = isApiConnected
      ? <Routes>{routes}</Routes>
      : <Preload />;
    return () => Component;
  }, [isApiConnected]);

  return (
    <>
      <Header balance={balance} pKey={pkey} />
      <NavMenu />
      <div className={styles.wrapper}>
        <View />
        <Notifications />
      </div>
    </>
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
  connectApi: (host:string) => dispatch(thunks.connectBeamApi(host)),
  getWalletStatus: () => dispatch(thunks.getWalletStatus())
});

export default connect(mapState, mapDispatch)(App);
