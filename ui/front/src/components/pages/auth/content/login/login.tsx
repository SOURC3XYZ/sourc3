import React from 'react';
import { Preload } from '@components/shared';
import { useAsyncError, useObjectState } from '@libs/hooks';
import styles from './login.module.css';
import { Password, UpdatingNode } from './content';

enum STATUS {
  LOGIN,
  LOADING,
  SYNC
}

type LoginProps = {
  startWalletApi: (password: string, cb: (err?: Error) => void) => void
};

type LoginState = {
  pass: string,
  status: STATUS,
};

const initial:LoginState = { pass: '', status: STATUS.LOGIN };

const Login = ({ startWalletApi }: LoginProps) => {
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

  // const View = () => {
  //   switch (status) {
  //     case STATUS.LOADING:
  //       return <Preload />;

  //     case STATUS.SYNC:
  //       return <UpdatingNode errorCatcher={throwError} />;

  //     default:
  //       return <Password pass={pass} onSubmit={onSubmit} onInput={onInput} />;
  //   }
  // };

  return (
    <div className={styles.wrapper}>
      {
        status === STATUS.LOADING
          ? <Preload />
          : status === STATUS.SYNC
            ? <UpdatingNode errorCatcher={throwError} />
            : <Password pass={pass} onSubmit={onSubmit} onInput={onInput} />
      }
    </div>
  );
};

export default Login;
