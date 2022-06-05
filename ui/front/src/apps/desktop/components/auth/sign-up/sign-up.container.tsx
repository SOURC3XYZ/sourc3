import { useCallback } from 'react';
import { Preload } from '@components/shared';
import NavButton from '@components/shared/nav-button/nav-button';
import { MODE } from '@libs/constants';
import { useSignUp } from '@libs/hooks/container/sign-up';
import styles from './sign-up.module.scss';
import { UpdatingNode } from '../update-node';
import { SeedGenerate } from './seed-generate';
import { SeedConfirm } from './seed-confirm';
import { PasswordRestore } from '../restore/password-restore';

function SignUp() {
  const {
    seed, mode, setNextMode, statusFetcher, endOfVerification, throwError
  } = useSignUp();

  const CurrentMode = useCallback(() => {
    switch (mode) {
      case MODE.SEED:
        return <SeedGenerate seed={seed} next={setNextMode} />;

      case MODE.CONFIRM:
        return <SeedConfirm seedGenerated={seed} next={setNextMode} />;

      case MODE.PASS:
        return <PasswordRestore onClick={endOfVerification} isCreate />;

      case MODE.OK:
        return (
          <div className={styles.syncStatusWrapper}>
            <UpdatingNode statusFetcher={statusFetcher} errorCatcher={throwError} />
          </div>
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
      <div className={styles.btnNav}>
        <NavButton
          name="Back"
          link="/auth"
        />
      </div>
    </div>
  );
}

export default SignUp;
