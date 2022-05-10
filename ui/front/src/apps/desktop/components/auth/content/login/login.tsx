import React from 'react';
import { Preload } from '@components/shared';
import { useAsyncError, useObjectState } from '@libs/hooks/shared';
import styles from './login.module.scss';
import { Password } from './content';
import { UpdatingNode } from '../update-node';

enum STATUS {
  LOGIN,
  LOADING,
  SYNC
}

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
    <div className={styles.wrapper}>
      {
        status === STATUS.LOADING
          ? <Preload />
          : status === STATUS.SYNC
            ? <UpdatingNode backButton statusFetcher={statusFetcher} errorCatcher={throwError} />
            : <Password pass={pass} onSubmit={onSubmit} onInput={onInput} />
      }
    </div>
  );
}

export default Login;
