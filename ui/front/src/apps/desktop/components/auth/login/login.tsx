import React from 'react';
import { Preload } from '@components/shared';
import { useAsyncError, useObjectState } from '@libs/hooks/shared';
import { PromiseArg } from '@types';
import { Sourc3Logo } from '@components/svg';
import styles from './login.module.scss';
import { UpdatingNode } from '../update-node';
import { Password } from './password';

enum STATUS { LOGIN, LOADING, SYNC }

type LoginProps = {
  statusFetcher: (resolve: PromiseArg<{ status: number }>) => void,
  startWalletApi: (password: string, cb: (err?: Error) => void) => void,
};
type LoginState = {
  pass: string,
  status: STATUS,
};

const initial:LoginState = { pass: '', status: STATUS.LOGIN };

function Login({ startWalletApi, statusFetcher }: LoginProps) {
  const [{ pass, status }, setState] = useObjectState<LoginState>(initial);
  const throwError = useAsyncError();

  const checkIsOk = (err?: Error) => {
    if (err) return throwError(err);
    return setState({ status: STATUS.SYNC });
  };

  const onSubmit = () => {
    startWalletApi(pass, checkIsOk);
    setState({ status: STATUS.LOADING });
  };

  const onInput = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => setState({ pass: e.target.value });

  return (

    status !== STATUS.SYNC ? (
      <div className={styles.wrapper}>
        <div className={styles.logo}>
          <Sourc3Logo fill="black" />
          <h3>desktop client</h3>
        </div>
        <div className={styles.intro}>
          <h2>Sign in</h2>
        </div>
        {
          status === STATUS.LOADING
            ? (
              <div>
                <Preload message="Loading" />
              </div>
            )
            : <Password pass={pass} onSubmit={onSubmit} onInput={onInput} />
        }
      </div>
    )
      : (
        <UpdatingNode
          backButton
          statusFetcher={statusFetcher}
          errorCatcher={throwError}
        />
      )
  );
}

export default Login;
