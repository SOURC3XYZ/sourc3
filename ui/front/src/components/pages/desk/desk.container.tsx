import { Preload } from '@components/shared';
import { thunks } from '@libs/action-creators';
import { AppThunkDispatch, RootState } from '@libs/redux';
import React from 'react';
import { connect } from 'react-redux';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Manager, Notifications, Repo } from '../main/content';
import { Header } from './content';
import Repositories from './content/repositories/repositories';
// import ReposEmpty from './content/repos-empty/repos-empty';
import styles from './desk.module.css';

type MainDeskProps = {
  getWalletStatus: () => void,
  getPublicKey: () => void,
  connectApi: () => void,
  isApiConnected: boolean,
  balance: number,
  pkey: string
};

const Desk = ({
  isApiConnected, connectApi, balance, getWalletStatus, getPublicKey, pkey
}: MainDeskProps) => {
  React.useEffect(() => {
    if (!isApiConnected) connectApi();
    if (isApiConnected) {
      if (!pkey) getPublicKey();
      getWalletStatus();
    }
  }, [isApiConnected]);
  return (
    <>
      <Header
        isWeb
        balance={balance}
        pKey={pkey}
      />
      <div className={styles.wrapper}>
        {
          isApiConnected
            ? (
              <Routes>
                <Route
                  path="/"
                  element={
                    <Navigate replace to="repositories/my/1" />
                  }
                />
                <Route
                  path="repositories/:type/:page"
                  element={<Repositories />}
                />
                <Route
                  path="/repo/:repoParams/*"
                  element={<Repo />}
                />
                <Route
                  path="manager"
                  element={(
                    <Manager
                      isDesk
                    />
                  )}
                />
              </Routes>
            )
            : (
              <Preload />
            )
        }
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
  },
  getPublicKey: () => {
    dispatch(thunks.getPublicKey());
  }
});

export default connect(mapState, mapDispatch)(Desk);
