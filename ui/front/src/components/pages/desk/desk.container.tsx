import { Preload } from '@components/shared';
import { thunks } from '@libs/action-creators';
import { AppThunkDispatch, RootState } from '@libs/redux';
import React from 'react';
import { connect } from 'react-redux';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Notifications } from '../main/content';
import { Header } from './content';
import ReposEmpty from './content/repos-empty/repos-empty';
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
                    <Navigate replace to="repositories" />
                  }
                />
                <Route
                  path="repositories"
                  element={<ReposEmpty />}
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
