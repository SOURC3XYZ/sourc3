/* eslint-disable @typescript-eslint/no-shadow */
import {
  AllRepos,
  Header,
  Manager, Notifications, Preload, Repo
} from '@components/shared';
import NavMenu from '@components/shared/menu/menu';
import { useSelector } from '@libs/redux';
import React, { useMemo } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useUserAction } from '@libs/hooks/thunk';
import styles from './main.module.scss';
import { LocalRepos } from './content';

function App() {
  const { isApiConnected, balance, pkey } = useSelector((state) => {
    const { isApiConnected, balance, pkey } = state.app;
    return { isApiConnected, balance, pkey };
  });

  const { connectToDesktopApi } = useUserAction();

  React.useEffect(() => {
    if (!isApiConnected) connectToDesktopApi();
  }, []);

  const data = [
    {
      path: '/',
      element: <Navigate replace to="repos/all/1" />
    },
    {
      path: 'repos/:type/:page',
      element: <AllRepos />
    },
    {
      path: '/repo/:repoParams/*',
      element: <Repo />
    },
    {
      path: 'manager',
      element: <Manager isDesk />
    },
    {
      path: '/localRepos',
      element: <LocalRepos />
    }
  ];

  const routes = data.map(
    ({ path, element }) => <Route key={path} path={path} element={element} />
  );

  const View = useMemo(() => {
    const Component = isApiConnected
      ? <Routes>{routes}</Routes>
      : <Preload message="loading" />;
    return () => Component;
  }, [isApiConnected]);

  return (
    <>
      <Header balance={balance} pKey={pkey} />
      <NavMenu />
      <div className={styles.wrapper}>
        <View />
        <Notifications />
      </div>
    </>
  );
}

export default App;
