import React from 'react';
import { RootState, AppThunkDispatch } from '@libs/redux';
import { connect } from 'react-redux';
import {
  Navigate, Route, Routes
} from 'react-router-dom';
import { thunks } from '@libs/action-creators';
import { Menu, Preload } from '@components/shared';
import {
  Notifications, Repo, AllRepos, Manager
} from './content';
import styles from './main.module.css';

type MainProps = {
  connectApi: () => void,
  mountWallet: () => void,
  isConnected: boolean,
  isWalletConnected: boolean
};

const Main = ({
  isConnected, isWalletConnected, connectApi, mountWallet
}:MainProps) => {
  React.useEffect(() => {
    connectApi();
    mountWallet();
  }, []);
  // const path = window.location.pathname === 'Pit_demo/app/index.html'
  //   ? 'Pit_demo/app/index.html'
  //   : window.location.pathname.substring(1);
  return (
    <>
      <div className={styles.main}>
        <Menu />
        {
          isConnected && isWalletConnected
            ? (
              <Routes>
                <Route
                  path="/"
                  element={
                    <Navigate replace to="/repos/all/1" />
                  }
                />
                <Route
                  path="/repos/:type/:page"
                  element={<AllRepos />}
                />
                <Route
                  path="/repo/:repoParams/*"
                  element={<Repo />}
                />
                <Route
                  path="/manager"
                  element={<Manager />}
                />
              </Routes>
            ) : <Preload />
        }
        <Notifications />
      </div>
    </>
  );
};

const mapState = ({
  app: { isConnected },
  wallet: { isWalletConnected }
}: RootState) => ({
  isConnected,
  isWalletConnected
});

const mapDispatch = (dispatch: AppThunkDispatch) => ({
  connectApi: () => {
    dispatch(thunks.connectBeamApi());
  },
  mountWallet: () => {
    dispatch(thunks.mountWallet());
  }
});

export default connect(mapState, mapDispatch)(Main);
