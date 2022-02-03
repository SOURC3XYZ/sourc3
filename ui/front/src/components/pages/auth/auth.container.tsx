import { ErrorBoundary } from '@components/hoc';
import { FailPage, Preload } from '@components/shared';
import { thunks } from '@libs/action-creators';
import { AppThunkDispatch, RootState } from '@libs/redux';
import React from 'react';
import { connect } from 'react-redux';
import { Route, Routes } from 'react-router-dom';
import { Login, Start, SignUp } from './content';
import { Restore } from './content/restore';
import styles from './auth.module.css';

type LoggedProps = {
  isWalletConnected: boolean;
  isApiConnected: boolean;
  mountWallet: () => void;
  killWalletApi: () => void;
  startWalletApi: (
    password: string
  ) => (
    resolve: PromiseArg<string>,
    reject: PromiseArg<string>
  ) => void
};

function Auth({
  isWalletConnected, isApiConnected,
  killWalletApi, mountWallet, startWalletApi
}: LoggedProps) {
  React.useEffect(() => {
    if (isApiConnected) killWalletApi();
    if (!isWalletConnected) mountWallet();
  }, []);

  return (
    <>
      {isWalletConnected && !isApiConnected
        ? (
          <div className={styles.logged}>
            <Routes>
              <Route
                path=""
                element={<Start />}
              />
              <Route
                path="login"
                element={(
                  <ErrorBoundary
                    fallback={() => (
                      <div style={{ margin: '0 auto' }}>
                        <FailPage subTitle="invalid pass" isBtn />
                      </div>
                    )}
                  >
                    <Login startWalletApi={startWalletApi} />
                  </ErrorBoundary>
                )}
              />
              <Route
                path="sign-up"
                element={<SignUp />}
              />
              <Route
                path="restore"
                element={<Restore />}
              />
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
  mountWallet: () => {
    dispatch(thunks.mountWallet());
  },
  killWalletApi: () => {
    dispatch(thunks.killBeamApi());
  },
  startWalletApi: (
    password: string
  ) => (
    resolve: PromiseArg<string>,
    reject: PromiseArg<string>
  ) => {
    dispatch(thunks.startWalletApi(password, resolve, reject));
  }
});

export default connect(mapState, mapDispatch)(Auth);
