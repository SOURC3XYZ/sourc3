import React from 'react';
import { RootState, AppThunkDispatch } from '@libs/redux';
import { connect } from 'react-redux';
import {
  Navigate, Route, Routes
} from 'react-router-dom';
import { thunks } from '@libs/action-creators';
import {
  Manager,
  Notifications,
  AllRepos,
  Preload,
  Repo,
  Header
} from '@components/shared';
import styles from './main.module.css';

type MainProps = {
  connectApi: () => void,
  isApiConnected: boolean,
  balance: number
  pkey: string

};

const Main = ({
  isApiConnected, connectApi, balance, pkey
}:MainProps) => {
  React.useEffect(() => {
    if (!isApiConnected) connectApi();
    // getWalletStatus();
  }, [isApiConnected]);

  const routes = [
    {
      path: '/',
      element: <Navigate replace to="repos/all/1" />
    },
    {
      path: 'repos/:type/:page',
      element: <AllRepos />
    },
    {
      path: 'repo/:repoParams/*',
      element: <Repo />
    },
    {
      path: 'manager',
      element: <Manager />
    }
  ];

  const RoutesView = () => (
    <Routes>
      {
        routes.map((el) => <Route path={el.path} element={el.element} />)
      }

    </Routes>
  );

  const View = () => (isApiConnected
    ? (
      <>
        <Header balance={balance} pKey={pkey} />
        <div className={styles.main}>
          <RoutesView />
          <Notifications />
        </div>
      </>
    )
    : <Preload />);

  return <View />;
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
  }
});

export default connect(mapState, mapDispatch)(Main);
