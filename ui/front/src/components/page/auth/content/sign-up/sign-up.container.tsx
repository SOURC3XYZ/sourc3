import { AppThunkDispatch, RootState } from '@libs/redux';
import { AC, thunks } from '@libs/action-creators';
import { connect } from 'react-redux';
import React, { useEffect } from 'react';
import { FailPage, OkPage, Preload } from '@components/shared';
import NavButton from '@components/shared/nav-button/nav-button';
import { message } from 'antd';
import { WALLET } from '@libs/constants';
import { SeedGenerate } from './container/seed-generate';
import { PasswordRestore } from '../restore/container';
import styles from './sign-up.module.css';
import { SeedConfirm } from './container';

type SignUpProps = {
  seedPhrase: string | null,
  generateSeed: () => void,
  restoreWallet: (
    seed: string[],
    pass: string,
    cb: (status: 'ok' | 'fail') => void) => void,
  clearSeed2Validation: (
    seed: string[], errors: boolean[]
  ) => void
};

const SignUp = ({
  generateSeed,
  seedPhrase,
  restoreWallet,
  clearSeed2Validation
}: SignUpProps) => {
  const seed:string[] = seedPhrase ? seedPhrase?.split(' ') : [];
  const clearSeed = new Array(WALLET.SEED_PHRASE_COUNT).fill('');
  const clearErrors = new Array(WALLET.SEED_PHRASE_COUNT).fill(false);
  useEffect(() => {
    generateSeed();
    clearSeed2Validation(clearSeed, clearErrors);
  }, []);

  const [mode, toggleMode] = React.useState<
  'seed' | 'confirm' | 'pass' | 'fail' | 'ok' | 'loading'>('seed');

  const endOfVerification = (base: string, repeat: string) => {
    if (base === repeat) {
      const setOk = (status: 'ok' | 'fail') => toggleMode(status);
      restoreWallet(seed as string[], base, setOk);
      toggleMode('loading');
    } else {
      message.error("Passwords don't match");
    }
  };

  const setNextMode = () => {
    if (mode === 'seed') { toggleMode('confirm'); } else {
      toggleMode('pass');
    }
  };

  const currentMode = () => {
    switch (mode) {
      case 'seed':
        return (
          <SeedGenerate
            seed={seed}
            next={setNextMode}
          />
        );
      case 'confirm':
        return (
          <SeedConfirm
            seedGenerated={seed}
            next={setNextMode}
          />
        );
      case 'pass':
        return (
          <PasswordRestore
            onClick={endOfVerification}
            isCreate
          />
        );
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
    <>
      {' '}
      <div className={styles.wrapper}>
        {currentMode()}
        <div className={styles.btnNav}>
          <NavButton
            name="Back"
            link="/auth"
          />
        </div>
      </div>

    </>
  );
};
const mapState = ({ wallet: { seedPhrase } }: RootState) => ({
  seedPhrase
});

const mapDispatch = (dispatch: AppThunkDispatch) => ({
  mountWallet: () => {
    dispatch(thunks.mountWallet());
  },

  generateSeed: () => {
    dispatch(thunks.generateSeed());
  },
  restoreWallet: (
    seed: string[], pass: string, callback: (status: 'ok' | 'fail') => void
  ) => {
    console.log('validate', seed, pass);
    dispatch(thunks.sendParams2Service(seed, pass, callback));
  },
  clearSeed2Validation: (
    seed: string[], errors: boolean[]
  ) => {
    dispatch(AC.setSeed2Validation({ seed, errors }));
  }
});
export default connect(mapState, mapDispatch)(SignUp);
