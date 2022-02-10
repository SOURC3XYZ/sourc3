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
  connectApi: () => void,
  isApiConnected: boolean
};

const Desk = ({ isApiConnected, connectApi }: MainDeskProps) => {
  React.useEffect(() => {
    if (!isApiConnected) connectApi();
  }, []);
  return (
    <>
      <Header
        isWeb
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
                  element={<Manager />}
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
  app: { isApiConnected }
}: RootState) => ({
  isApiConnected
});

const mapDispatch = (dispatch: AppThunkDispatch) => ({
  connectApi: () => {
    dispatch(thunks.connectBeamApi());
  }
});

export default connect(mapState, mapDispatch)(Desk);
