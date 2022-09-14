import { Preload } from '@components/shared';
import { Route, Routes } from 'react-router-dom';
import { useAuth } from '@libs/hooks/container/auth';
import { ErrorBoundary } from '@components/context';
import styles from './auth.module.scss';
import { Start } from './start';
import { SignUp } from './sign-up';
import { Login } from './login';
import { Restore } from './restore';

function Auth() {
  const {
    isConnected,
    startWalletApi,
    statusFetcher
  } = useAuth();

  const data = [
    {
      link: '/', component: <Start />
    },
    {
      link: 'sign-up', component: <SignUp />
    },
    {
      link: 'login',
      component: <Login
        statusFetcher={statusFetcher}
        startWalletApi={startWalletApi}
      />
    },
    {
      link: 'start', component: <Start restore />
    },
    {
      link: 'restore', component: <Restore />
    }
  ];

  const routeElements = data.map((el, i) => (
    <Route
      key={el.link}
      path={el.link}
      element={(
        i
          ? (
            <ErrorBoundary>
              {el.component}
            </ErrorBoundary>
          )
          : el.component
      )}
    />
  ));

  return (isConnected
    ? (
      <div className={styles.logged}>
        <Routes>
          {routeElements}
        </Routes>
      </div>
    )
    : <Preload message="loading" />
  );
}

export default Auth;
