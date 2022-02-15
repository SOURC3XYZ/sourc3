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
import { Header } from '../desk/content';

type MainProps = {
  getWalletStatus: () => void,
  getPublicKey: () => void,
  connectApi: () => void,
  isApiConnected: boolean,
  balance: number
  pkey: string

};

const Main = ({
  isApiConnected, connectApi, balance, getWalletStatus, pkey, getPublicKey
}:MainProps) => {
  React.useEffect(() => {
    if (!isApiConnected) connectApi();
    if (isApiConnected) {
      if (!pkey) getPublicKey();
      getWalletStatus();
    }
  }, [isApiConnected]);

  React.useEffect(() => {
    getWalletStatus();
    if (!pkey) getPublicKey();
  }, [isApiConnected]);

  // const path = window.location.pathname === 'Pit_demo/app/index.html'
  //   ? 'Pit_demo/app/index.html'
  //   : window.location.pathname.substring(1);
  // const onClick = () => {
  //   window.postMessage({
  //     type: 'select-dirs'
  //   });
  //   const messageHandler = (e:MessageEvent<any>) => {
  //     if (e.data.type === 'select-dirs-answer') {
  //       console.log(e.data.path);
  //       window.removeEventListener('message', messageHandler);
  //     }
  //   };

  //   window.addEventListener('message', messageHandler);
  // };
  // TODO: local git handler
  return (
    <>
      <Header
        balance={balance}
        pKey={pkey}

      />
      <div className={styles.main}>
        <Menu />
        {/* <div>
          <Button onClick={onClick}>click</Button>
        </div> */}
        {
          isApiConnected
            ? (
              <Routes>
                <Route
                  path="/"
                  element={
                    <Navigate replace to="repos/all/1" />
                  }
                />
                <Route
                  path="repos/:type/:page"
                  element={(
                    <AllRepos
                      isWeb
                    />
                  )}
                />
                <Route
                  path="repo/:repoParams/*"
                  element={<Repo />}
                />
                <Route
                  path="manager"
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

export default connect(mapState, mapDispatch)(Main);
