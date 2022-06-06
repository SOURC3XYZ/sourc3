import { ErrorBoundary } from '@components/hoc';
import { FailPage, Preload } from '@components/shared';
import { Route, Routes } from 'react-router-dom';
import { useAuth } from '@libs/hooks/container/auth';
import styles from './auth.module.scss';
import { Start } from './start';
import { SignUp } from './sign-up';
import { Login } from './login';
import { Restore } from './restore';

type FallbackProps = {
  message: string
};

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
      link: 'restore', component: <Restore />
    }
  ];

  const fallback = ({ message }:FallbackProps) => (
    <div style={{ margin: '0 auto' }}>
      <FailPage comeBack="/auth/" subTitle={message || 'invalid pass'} isBtn />
    </div>
  );

  const routeElements = data.map((el, i) => (
    <Route
      key={el.link}
      path={el.link}
      element={(
        i
          ? (
            <ErrorBoundary fallback={fallback}>
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
