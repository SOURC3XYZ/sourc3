import { AppThunkDispatch, RootState } from '@libs/redux';
import { AC, thunks } from '@libs/action-creators';
import { connect } from 'react-redux';
import React, { useEffect } from 'react';
import { OkPage, Preload } from '@components/shared';
import NavButton from '@components/shared/nav-button/nav-button';
import { message } from 'antd';
import { WALLET } from '@libs/constants';
import { useAsyncError } from '@libs/hooks/shared';
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
    cb: (err?: Error) => void) => void,
  clearSeed2Validation: (
    seed: string[], errors: boolean[]
  ) => void
};

enum MODE { SEED, CONFIRM, PASS, OK, LOADING }

function SignUp({
  generateSeed,
  seedPhrase,
  restoreWallet,
  clearSeed2Validation
}: SignUpProps) {
  const seed:string[] = seedPhrase ? seedPhrase?.split(' ') : [];
  const clearSeed = new Array(WALLET.SEED_PHRASE_COUNT).fill('');
  const clearErrors = new Array(WALLET.SEED_PHRASE_COUNT).fill(false);

  const throwError = useAsyncError();

  useEffect(() => {
    generateSeed();
    clearSeed2Validation(clearSeed, clearErrors);
  }, []);

  const [mode, toggleMode] = React.useState<MODE>(MODE.SEED);

  const setOk = (err?: Error) => {
    if (err) return throwError(err);
    return toggleMode(MODE.OK);
  };

  const endOfVerification = (base: string, repeat: string) => {
    if (base === repeat) {
      restoreWallet(seed as string[], base, setOk);
      return toggleMode(MODE.LOADING);
    }
    return message.error("Passwords don't match");
  };

  const setNextMode = () => {
    if (mode === MODE.SEED) return toggleMode(MODE.CONFIRM);
    return toggleMode(MODE.PASS);
  };

  const currentMode = () => {
    switch (mode) {
      case MODE.SEED:
        return <SeedGenerate seed={seed} next={setNextMode} />;

      case MODE.CONFIRM:
        return <SeedConfirm seedGenerated={seed} next={setNextMode} />;

      case MODE.PASS:
        return <PasswordRestore onClick={endOfVerification} isCreate />;

      case MODE.OK:
        return <OkPage subTitle="wallet restored" />;
        // TODO: DANIK: make a generalized component

      case MODE.LOADING:
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
          link="/auth"
        />
      </div>
    </div>
  );
}
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
  restoreWallet: (seed: string[], pass: string, callback: (err?: Error) => void) => {
    console.log('validate', seed, pass);
    dispatch(thunks.sendParams2Service(seed, pass, callback));
  },
  clearSeed2Validation: (seed: string[], errors: boolean[]) => {
    dispatch(AC.setSeed2Validation({ seed, errors }));
  }
});
export default connect(mapState, mapDispatch)(SignUp);
