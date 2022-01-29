import { AppThunkDispatch, RootState } from '@libs/redux';
import { thunks } from '@libs/action-creators';
import { connect } from 'react-redux';
import { Button, message } from 'antd';
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FailPage, OkPage, Preload } from '@components/shared';
import { SeedGenerate } from './seed-generate';
import { PasswordRestore } from '../restore/container';
import styles from './sign-up.module.css';

type SignUpProps = {
  seedPhrase: string | null,
  generateSeed: () => void,
  restoreWallet: (
    seed: string[],
    pass: string,
    cb: (status: 'ok' | 'fail') => void) => void
};

const SignUp = ({
  generateSeed,
  seedPhrase,
  restoreWallet
}: SignUpProps) => {
  const seed:string[] = seedPhrase ? seedPhrase?.split(' ') : [];

  useEffect(() => {
    generateSeed();
  }, []);

  const [mode, toggleMode] = React.useState<
  'seed' | 'pass' | 'fail' | 'ok' | 'loading'>('seed');

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
    toggleMode('pass');
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
          <Button style={{ borderRadius: 7 }}>
            <Link
              to="/auth"
            >
              Back

            </Link>
          </Button>
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
  }
});
export default connect(mapState, mapDispatch)(SignUp);
