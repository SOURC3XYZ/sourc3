import { useCallback } from 'react';
import { Preload } from '@components/shared';
import { MODE } from '@libs/constants';
import { useSignUp } from '@libs/hooks/container/sign-up';
import styles from './sign-up.module.scss';
import { UpdatingNode } from '../update-node';
import { SeedGenerate } from './seed-generate';
import { SeedConfirm } from './seed-confirm';
import { PasswordRestore } from '../restore/password-restore';
import { AuthInfo } from './auth-info';

function SignUp() {
  const {
    seed, mode, setNextMode, statusFetcher, endOfVerification, throwError, setBackMode
  } = useSignUp();

  const CurrentMode = useCallback(() => {
    switch (mode) {
      case MODE.AUTHINFO:
        return (
          <AuthInfo
            back={setBackMode}
            next={setNextMode}
          />
        );
      case MODE.SEED:
        return (
          <SeedGenerate
            back={setBackMode}
            seed={seed}
            next={setNextMode}
          />
        );

      case MODE.CONFIRM:
        return (
          <SeedConfirm
            back={setBackMode}
            seedGenerated={seed}
            next={setNextMode}
          />
        );

      case MODE.PASS:
        return (
          <PasswordRestore
            back={setBackMode}
            onClick={endOfVerification}
          />
        );

      case MODE.OK:
        return (
          <UpdatingNode
            back={setBackMode}
            statusFetcher={statusFetcher}
            errorCatcher={throwError}
          />
        );
        // TODO: DANIK: make a generalized component

      case MODE.LOADING:
        return <Preload message="loading" />;
      default:
        break;
    }
    return <>no data</>;
  }, [mode, seed]);

  return (
    <div className={styles.wrapper}>
      <CurrentMode />
    </div>
  );
}

export default SignUp;
