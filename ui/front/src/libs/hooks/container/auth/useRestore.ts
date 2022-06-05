import { RestoreStatus, WALLET } from '@libs/constants';
import { useAsyncError } from '@libs/hooks/shared';
import { useWalletAction } from '@libs/hooks/thunk';
import { useSelector } from '@libs/redux';
import { message } from 'antd';
import { useEffect, useState } from 'react';

export const useRestore = () => {
  const seed2Validation = useSelector((state) => state.wallet.seed2Validation);
  const { statusFetcher, restoreWallet, validate } = useWalletAction();

  const throwError = useAsyncError();
  const [mode, toggleMode] = useState<RestoreStatus>(RestoreStatus.SEED);
  const { seed, errors } = seed2Validation;

  const setOk = (err?:Error) => {
    if (err) return throwError(err);
    return toggleMode(RestoreStatus.OK);
  };

  const endOfVerification = (base: string, repeat: string) => {
    if (base === repeat && !errors.includes(false)) {
      restoreWallet(seed as string[], base, setOk);
      toggleMode(RestoreStatus.LOADING);
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
    if (!errors.includes(false)) toggleMode(RestoreStatus.PASS);
  };

  return {
    mode,
    seed,
    errors,
    throwError,
    endOfVerification,
    setNextMode,
    restoreWallet,
    statusFetcher,
    validate
  };
};

// const mapState = ({
//     wallet: { seed2Validation }
//   }: RootState) => ({
//     seed2Validation
//   });

//   const mapDispatch = (dispatch: AppThunkDispatch) => ({
//     validate: (seed: string[]) => dispatch(thunks.validateSeed(seed)),

//     restoreWallet: (seed: string[], pass: string, callback: (err?:Error) => void) => dispatch(
//       thunks.sendParams2Service(seed, pass, callback)
//     ),

//     statusFetcher: (
//       resolve: PromiseArg<{ status: number }>
//     ) => dispatch(thunks.getSyncStatus(resolve)),

//     validatePasted: (seedArr: string[]) => dispatch(thunks.validateSeed(seedArr))
//   });
