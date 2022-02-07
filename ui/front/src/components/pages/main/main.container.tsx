import React from 'react';
import { RootState, AppThunkDispatch } from '@libs/redux';
import { connect } from 'react-redux';
import {
  Navigate, Route, Routes
} from 'react-router-dom';
import { thunks } from '@libs/action-creators';
import { Menu, Preload } from '@components/shared';
import { Button } from 'antd';
import {
  Notifications, Repo, AllRepos, Manager
} from './content';
import styles from './main.module.css';
import { Header } from '../desk/content';

type MainProps = {
  connectApi: () => void,
  isApiConnected: boolean
};

const Main = ({
  isApiConnected, connectApi
}:MainProps) => {
  React.useEffect(() => {
    if (!isApiConnected) connectApi();
  }, []);

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
  //TODO: local git handler
  return (
    <>
      <Header />
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
                  element={<AllRepos />}
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
  app: { isApiConnected }
}: RootState) => ({
  isApiConnected
});

const mapDispatch = (dispatch: AppThunkDispatch) => ({
  connectApi: () => {
    dispatch(thunks.connectBeamApi());
  }
});

export default connect(mapState, mapDispatch)(Main);
