import { Preload } from '@components/shared';
import { NavButton } from '@components/shared/nav-button';
import { RestoreStatus } from '@libs/constants';
import { useRestore } from '@libs/hooks/container/auth';
import { UpdatingNode } from '../update-node';
import { PasswordRestore } from './password-restore';
import styles from './restore.module.scss';
import { SeedRestore } from './seed-restore';

function Restore() {
  const {
    mode,
    seed,
    errors,
    throwError,
    endOfVerification,
    setNextMode,
    statusFetcher,
    validate
  } = useRestore();

  const currentMode = () => {
    switch (mode) {
      case RestoreStatus.SEED:
        return (
          <SeedRestore
            seed={seed}
            errors={errors}
            validate={validate}
            validatePasted={validate}
            next={setNextMode}
          />
        );
      case RestoreStatus.PASS:
        return <PasswordRestore onClick={endOfVerification} />;
      case RestoreStatus.OK:
        return (
          <div className={styles.syncStatusWrapper}>
            <UpdatingNode statusFetcher={statusFetcher} errorCatcher={throwError} />
          </div>
        );
        // TODO: DANIK: make a generalized component
      case RestoreStatus.LOADING:
        return <Preload message="" />;
      default:
        break;
    }
    return <>no data</>;
  };

  return (
    <div className={styles.wrapper}>
      {currentMode()}
      <div className={styles.btnNav}>
        <NavButton
          name="Back"
          link="/auth/login"
        />
      </div>
    </div>
  );
}

export default Restore;
