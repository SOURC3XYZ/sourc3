import { Preload } from '@components/shared';
import NavMenu from '@components/shared/menu/menu';
import { thunks } from '@libs/action-creators';
import { AppThunkDispatch, RootState } from '@libs/redux';
import React, { useMemo } from 'react';
import { connect } from 'react-redux';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Manager, Notifications, Repo } from '../main/content';
import { Header } from './content';
import LocalRepos from './content/local-rep/local-rep';
import Repositories from './content/repositories/repositories';
import styles from './desk.module.css';

type MainDeskProps = {
  getWalletStatus: () => void,
  connectApi: () => void,
  isApiConnected: boolean,
  balance: number,
  pkey: string
};

const Desk = ({
  isApiConnected, connectApi, balance, getWalletStatus, pkey
}: MainDeskProps) => {
  React.useEffect(() => {
    if (!isApiConnected) connectApi();
    getWalletStatus();
  }, []);

  const data = [
    {
      path: '/',
      element: <Navigate replace to="repositories/my/1" />
    },
    {
      path: 'repositories/:type/:page',
      element: <Repositories />
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
    path:"/localRepos",
  element:<LocalRepos />
}
  ];

  const routes = data.map(
    ({ path, element }) => <Route path={path} element={element} />
  );

  const View = useMemo(() => () => (
    isApiConnected
      ? <Routes>{routes}</Routes>
      : <Preload />
  ), [isApiConnected]);

  return (
    <>
      <Header isWeb balance={balance} pKey={pkey} />
      <NavMenu />
      <div className={styles.wrapper}>
        <View />
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
  connectApi: () => {
    dispatch(thunks.connectBeamApi());
  },
  getWalletStatus: () => {
    dispatch(thunks.getWalletStatus());
  }
});

export default connect(mapState, mapDispatch)(Desk);
