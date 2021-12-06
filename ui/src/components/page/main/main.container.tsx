import React from 'react';
import { RootState, AppThunkDispatch, thunks } from '@libs/redux';
import { connect } from 'react-redux';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AllRepos, Notifications } from '@components/container';
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
                element={<AllRepos />}
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
  },
  getAllRepos: () => {
    dispatch(thunks.getAllRepos());
  }
});

export default connect(mapState, mapDispatch)(Main);
