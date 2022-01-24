import { Preload } from '@components/shared';
import { thunks } from '@libs/action-creators';
import { AppThunkDispatch, RootState } from '@libs/redux';
import React from 'react';
import { connect } from 'react-redux';
import { Route, Routes } from 'react-router-dom';
import { Login, Start, SignUp } from './content';
import { Restore } from './content/restore';
import styles from './logged.module.css';

type LoggedProps = {
  isWalletConnected: boolean;
  mountWallet: () => void;
};

function Logged({ isWalletConnected, mountWallet }:LoggedProps) {
  React.useEffect(() => {
    if (!isWalletConnected) mountWallet();
  }, []);
  return (
    <>
      {isWalletConnected
        ? (
          <div className={styles.logged}>
            <Routes>
              <Route
                path=""
                element={<Start />}
              />
              <Route
                path="login"
                element={<Login />}
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

const mapState = ({ wallet: { isWalletConnected } }: RootState) => ({
  isWalletConnected
});

const mapDispatch = (dispatch: AppThunkDispatch) => ({
  mountWallet: () => {
    dispatch(thunks.mountWallet());
  }
});

export default connect(mapState, mapDispatch)(Logged);
