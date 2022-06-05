import { MODE, WALLET } from '@libs/constants';
import { useAsyncError } from '@libs/hooks/shared';
import { useWalletAction } from '@libs/hooks/thunk';
import { useSelector } from '@libs/redux';
import { message } from 'antd';
import { useEffect, useState } from 'react';

const useSignUp = () => {
  const seedPhrase = useSelector((state) => state.wallet.seedPhrase);
  const {
    generateSeed, restoreWallet, clearSeed2Validation, statusFetcher
  } = useWalletAction();

  const seed:string[] = seedPhrase ? seedPhrase?.split(' ') : [];
  const clearSeed = new Array(WALLET.SEED_PHRASE_COUNT).fill('');
  const clearErrors = new Array(WALLET.SEED_PHRASE_COUNT).fill(false);

  const throwError = useAsyncError();

  useEffect(() => {
    generateSeed();
    clearSeed2Validation(clearSeed, clearErrors);
  }, []);

  const [mode, toggleMode] = useState<MODE>(MODE.SEED);

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

  return {
    seed,
    mode,
    generateSeed,
    restoreWallet,
    endOfVerification,
    clearSeed2Validation,
    statusFetcher,
    setNextMode,
    throwError
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
