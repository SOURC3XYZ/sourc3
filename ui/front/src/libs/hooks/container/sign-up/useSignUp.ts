import { useErrorBoundary } from '@components/context';
import { MODE, WALLET } from '@libs/constants';
import { useWalletAction } from '@libs/hooks/thunk';
import { useSelector } from '@libs/redux';
import { message } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const useSignUp = () => {
  const seedPhrase = useSelector((state) => state.wallet.seedPhrase);
  const {
    generateSeed, restoreWallet, clearSeed2Validation, statusFetcher
  } = useWalletAction();

  const seed:string[] = seedPhrase ? seedPhrase?.split(' ') : [];
  const clearSeed = new Array(WALLET.SEED_PHRASE_COUNT).fill('');
  const clearErrors = new Array(WALLET.SEED_PHRASE_COUNT).fill(false);

  const throwError = useErrorBoundary();

  useEffect(() => {
    generateSeed();
    clearSeed2Validation(clearSeed, clearErrors);
  }, []);

  const [mode, toggleMode] = useState<MODE>(MODE.AUTHINFO);
  const navigate = useNavigate();

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
    switch (mode) {
      case MODE.AUTHINFO:
        return toggleMode(MODE.SEED);
      case MODE.SEED:
        return toggleMode(MODE.CONFIRM);
      case MODE.CONFIRM:
        return toggleMode(MODE.PASS);
      default:
        return toggleMode(MODE.AUTHINFO);
    }
  };

  const setBackMode = () => {
    switch (mode) {
      case MODE.AUTHINFO:
        return navigate('/auth/start');
      case MODE.SEED:
        return toggleMode(MODE.AUTHINFO);
      case MODE.CONFIRM:
        return toggleMode(MODE.SEED);
      case MODE.PASS:
        return toggleMode(MODE.CONFIRM);
      case MODE.OK:
        return toggleMode(MODE.PASS);
      default:
        return toggleMode(MODE.AUTHINFO);
    }
  };

  return {
    seed,
    mode,
    generateSeed,
    restoreWallet,
    endOfVerification,
    clearSeed2Validation,
    statusFetcher,
    setNextMode,
    throwError,
    setBackMode
  };
};

export default useSignUp;

// const mapState = ({ wallet: { seedPhrase } }: RootState) => ({
//   seedPhrase
// });

// const mapDispatch = (dispatch: AppThunkDispatch) => ({
//   mountWallet: () => {
//     dispatch(thunks.mountWallet());
//   },

//   generateSeed: () => {
//     dispatch(thunks.generateSeed());
//   },
//   restoreWallet: (seed: string[], pass: string, callback: (err?: Error) => void) => {
//     console.log('validate', seed, pass);
//     dispatch(thunks.sendParams2Service(seed, pass, callback));
//   },
//   clearSeed2Validation: (seed: string[], errors: boolean[]) => {
//     dispatch(AC.setSeed2Validation({ seed, errors }));
//   },
//   statusFetcher: (
//     resolve: PromiseArg<{ status: number }>
//   ) => dispatch(thunks.getSyncStatus(resolve))
// });
