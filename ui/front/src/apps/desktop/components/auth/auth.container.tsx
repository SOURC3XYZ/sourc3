import { ErrorBoundary } from '@components/hoc';
import { FailPage, Preload } from '@components/shared';
import { thunks } from '@libs/action-creators';
import { AppThunkDispatch, RootState } from '@libs/redux';
import { connect } from 'react-redux';
import { Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';
import { Login, Start, SignUp } from './content';
import { Restore } from './content/restore';
import styles from './auth.module.css';

type LoggedProps = {
  isWalletConnected: boolean;
  isApiConnected: boolean;
  mountWallet: () => void;
  killWalletApi: () => void;
  startWalletApi: (password: string, cb: (err?: Error) => void) => void
};

type FallbackProps = {
  message: string
};

function Auth({
  isWalletConnected,
  isApiConnected,
  killWalletApi,
  mountWallet,
  startWalletApi
}: LoggedProps) {
  const isConnected = isWalletConnected && !isApiConnected;

  useEffect(() => {
    if (isApiConnected) killWalletApi();
    if (!isWalletConnected) mountWallet();
  }, []);

  const data = [
    {
      link: '', component: <Start />
    },
    {
      link: 'sign-up', component: <SignUp />
    },
    {
      link: 'login', component: <Login startWalletApi={startWalletApi} />
    },
    {
      link: 'restore', component: <Restore />
    }
  ];

  const fallback = ({ message }:FallbackProps) => (
    <div style={{ margin: '0 auto' }}>
      <FailPage comeBack="/auth" subTitle={message || 'invalid pass'} isBtn />
    </div>
  );

  const routeElements = data.map((el, i) => (
    <Route
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

  return (
    <>
      {isConnected
        ? (
          <div className={styles.logged}>
            <Routes>
              {routeElements}
            </Routes>
          </div>
        )
        : <Preload />}
    </>
  );
}

const mapState = (
  { wallet: { isWalletConnected }, app: { isApiConnected } }: RootState
) => ({
  isApiConnected,
  isWalletConnected
});

const mapDispatch = (dispatch: AppThunkDispatch) => ({
  mountWallet: () => dispatch(thunks.mountWallet()),
  killWalletApi: () => dispatch(thunks.killBeamApi()),
  startWalletApi: (
    password: string, cb: (err?:Error) => void
  ) => dispatch(thunks.startWalletApi(password, cb))
});

export default connect(mapState, mapDispatch)(Auth);
