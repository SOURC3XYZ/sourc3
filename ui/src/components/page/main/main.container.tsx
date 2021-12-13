import React from 'react';
import { RootState, AppThunkDispatch } from '@libs/redux';
import { connect } from 'react-redux';
import { Navigate, Route, Routes } from 'react-router-dom';
import {
  AllRepos, Notifications, UserRepos
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

  return (
    <>
      <div className={styles.main}>
        {
          isConnected
          && (
            <Routes>
              <Route path="/" element={<Navigate replace to="/repos" />} />
              <Route
                path="/repos/"
                element={<AllRepos />}
              />
              <Route
                path="/my-repos/"
                element={<UserRepos />}
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
