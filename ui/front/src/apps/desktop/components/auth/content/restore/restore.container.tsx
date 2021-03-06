import { Preload } from '@components/shared';
import { NavButton } from '@components/shared/nav-button';
import { thunks } from '@libs/action-creators';
import { WALLET } from '@libs/constants';
import { useAsyncError } from '@libs/hooks/shared';
import { AppThunkDispatch, RootState } from '@libs/redux';
import { PromiseArg, Seed2ValidationType } from '@types';
import { message } from 'antd';
import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { UpdatingNode } from '../update-node';
import { PasswordRestore } from './container';
import { SeedRestore } from './container/seed-restore';
import styles from './restore.module.scss';

enum Status {
  SEED,
  PASS,
  OK,
  LOADING
}

type RestorePropsType = {
  seed2Validation: Seed2ValidationType
  validate: (seed: string[]) => void;
  validatePasted: (seedArr: string[]) => void;
  statusFetcher: (resolve: PromiseArg<{ status: number }>) => void,
  restoreWallet: (
    seed: string[],
    pass: string,
    cb: (err?:Error) => void
  ) => void
};

function Restore({
  seed2Validation,
  validate,
  restoreWallet,
  statusFetcher,
  validatePasted
}:RestorePropsType) {
  const throwError = useAsyncError();
  const [mode, toggleMode] = useState<Status>(Status.SEED);
  const { seed, errors } = seed2Validation;

  const setOk = (err?:Error) => {
    if (err) return throwError(err);
    return toggleMode(Status.OK);
  };

  const endOfVerification = (base: string, repeat: string) => {
    if (base === repeat && !errors.includes(false)) {
      restoreWallet(seed as string[], base, setOk);
      toggleMode(Status.LOADING);
    } else {
      message.error("Passwords don't match");
    }
  };
  const onClearSeed = () => {
    const emptySeed = new Array(WALLET.SEED_PHRASE_COUNT).fill('');
    validate(emptySeed);
  };

  useEffect(() => {
    onClearSeed();
  }, []);

  const setNextMode = () => {
    if (!errors.includes(false)) toggleMode(Status.PASS);
  };

  const currentMode = () => {
    switch (mode) {
      case Status.SEED:
        return (
          <SeedRestore
            seed={seed}
            errors={errors}
            validate={validate}
            validatePasted={validatePasted}
            next={setNextMode}
          />
        );
      case Status.PASS:
        return <PasswordRestore onClick={endOfVerification} />;
      case Status.OK:
        return (
          <div className={styles.syncStatusWrapper}>
            <UpdatingNode statusFetcher={statusFetcher} errorCatcher={throwError} />
          </div>
        );
        // TODO: DANIK: make a generalized component
      case Status.LOADING:
        return <Preload />;
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

const mapState = ({
  wallet: { seed2Validation }
}: RootState) => ({
  seed2Validation
});

const mapDispatch = (dispatch: AppThunkDispatch) => ({
  validate: (seed: string[]) => dispatch(thunks.validateSeed(seed)),

  restoreWallet: (seed: string[], pass: string, callback: (err?:Error) => void) => dispatch(
    thunks.sendParams2Service(seed, pass, callback)
  ),

  statusFetcher: (
    resolve: PromiseArg<{ status: number }>
  ) => dispatch(thunks.getSyncStatus(resolve)),

  validatePasted: (seedArr: string[]) => dispatch(thunks.validateSeed(seedArr))
});

export default connect(mapState, mapDispatch)(Restore);
