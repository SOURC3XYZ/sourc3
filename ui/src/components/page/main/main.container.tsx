import React from 'react';
import { RootState, AppThunkDispatch } from '@libs/redux';
import { connect } from 'react-redux';
import { Navigate, Route, Routes } from 'react-router-dom';
import {
  AllRepos, FileText, Notifications, Repo
} from '@components/container';
import { thunks } from '@libs/action-creators';
import styles from './main.module.css';

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
                path="/repos"
                element={<AllRepos />}
              />
              <Route
                path="repos/:id/tree/"
                element={<Repo />}
              />

              <Route
                path="data/:id/:oid"
                element={<FileText />}
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
