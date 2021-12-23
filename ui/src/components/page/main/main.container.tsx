import React from 'react';
import { RootState, AppThunkDispatch } from '@libs/redux';
import { connect } from 'react-redux';
import {
  Navigate, Route, Routes
} from 'react-router-dom';
import {
  AllRepos, Notifications
} from '@components/container';
import { thunks } from '@libs/action-creators';
import styles from './main.module.css';
import { Repo } from './container';

type MainProps = {
  connectApi: () => void,
  isConnected: boolean
};

const Main = ({
  isConnected, connectApi
}:MainProps) => {
  React.useEffect(() => {
    connectApi();
  }, []);
  const path = window.location.pathname === 'Pit_demo/app/index.html'
    ? 'Pit_demo/app/index.html'
    : window.location.pathname.substring(1);
  return (
    <>
      <div className={styles.main}>
        {
          isConnected
          && (
            <Routes>
              <Route
                path={`/${path}`}
                element={
                  <Navigate replace to="/repos/all/1" />
                }
              />
              <Route
                path="/repos/:type/:page"
                element={<AllRepos />}
              />
              <Route
                path="/repo/:id/*"
                element={<Repo />}
              />
            </Routes>
          )
        }
        <Notifications />
      </div>
    </>
  );
};

const mapState = ({ app: { isConnected } }: RootState) => ({
  isConnected
});

const mapDispatch = (dispatch: AppThunkDispatch) => ({
  connectApi: () => {
    dispatch(thunks.connectBeamApi());
  }
});

export default connect(mapState, mapDispatch)(Main);
