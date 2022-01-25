import { FailPage, OkPage, Preload } from '@components/shared';
import { thunks } from '@libs/action-creators';
import { AppThunkDispatch, RootState } from '@libs/redux';
import { Seed2ValidationType } from '@types';
import { Button } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { PasswordRestore } from './container';
import { SeedRestore } from './container/seed-restore';
import styles from './restore.module.css';

type RestorePropsType = {
  seed2Validation: Seed2ValidationType
  validate: (seed: string[]) => void;
  validatePasted: (seedArr: string[]) => void;
  restoreWallet: (
    seed: string[],
    pass: string,
    cb: (status: 'ok' | 'fail') => void) => void
};

const Restore = ({
  seed2Validation,
  validate,
  restoreWallet,
  validatePasted
}:RestorePropsType) => {
  const [mode, toggleMode] = React.useState<
  'seed' | 'pass' | 'fail' | 'ok' | 'loading'>('seed');
  const { seed, errors } = seed2Validation;

  const endOfVerification = (base: string, repeat: string) => {
    if (base === repeat && !errors.includes(false)) {
      const setOk = (status: 'ok' | 'fail') => toggleMode(status);
      restoreWallet(seed as string[], base, setOk);
      toggleMode('loading');
    }
  };

  const setNextMode = () => {
    if (!errors.includes(false)) toggleMode('pass');
  };

  const currentMode = () => {
    switch (mode) {
      case 'seed':
        return (
          <SeedRestore
            seed={seed}
            errors={errors}
            validate={validate}
            validatePasted={validatePasted}
            next={setNextMode}
          />
        );
      case 'pass':
        return <PasswordRestore onClick={endOfVerification} />;
      case 'ok':
        return <OkPage subTitle="wallet restored" />;
        // TODO: DANIK: make a generalized component
      case 'fail':
        return <FailPage subTitle="bad params" />;
      case 'loading':
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
        <Button style={{ borderRadius: 7, margin: '0 auto' }}>
          <Link to="/auth/login">back</Link>
        </Button>
      </div>
    </div>
  );
};

const mapState = ({
  wallet: { seed2Validation }
}: RootState) => ({
  seed2Validation
});

const mapDispatch = (dispatch: AppThunkDispatch) => ({
  validate: (seed: string[]) => {
    dispatch(thunks.validateSeed(seed));
  },
  restoreWallet: (
    seed: string[], pass: string, callback: (status: 'ok' | 'fail') => void
  ) => {
    console.log('validate', seed, pass);
    dispatch(thunks.sendParams2Service(seed, pass, callback));
  },
  validatePasted: (seedArr: string[]) => {
    dispatch(thunks.validateSeed(seedArr));
  }
});

export default connect(mapState, mapDispatch)(Restore);
