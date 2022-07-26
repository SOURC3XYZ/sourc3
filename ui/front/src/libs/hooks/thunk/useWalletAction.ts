import { useSourc3Api } from '@components/context';
import { AC } from '@libs/action-creators';
import { walletThunk } from '@libs/action-creators/async';
import { useDispatch } from '@libs/redux';
import { ArgumentTypes, CallIPCType, PromiseArg } from '@types';

const useWalletAction = () => {
  const dispatch = useDispatch();
  const api = useSourc3Api();
  const thunks = walletThunk(api.callIPC as CallIPCType);

  const mountWallet = () => dispatch(thunks.mountWallet());

  const killWalletApi = () => dispatch(thunks.killBeamApi());

  const startWalletApi = (
    password: string,
    cb: (err?:Error) => void
  ) => dispatch(thunks.startWalletApi(password, cb));

  const statusFetcher = (
    resolve: PromiseArg<{ status: number }>
  ) => dispatch(thunks.getSyncStatus(resolve));

  const generateSeed = () => dispatch(thunks.generateSeed());

  const restoreWallet = (...args: ArgumentTypes<typeof thunks.restoreWallet>) => {
    dispatch(thunks.restoreWallet(...args));
  };

  const clearSeed2Validation = (seed: string[], errors: boolean[]) => {
    dispatch(AC.setSeed2Validation({ seed, errors }));
  };

  const validate = (seed: string[]) => dispatch(thunks.validateSeed(seed));

  const cloneRepo = (local:string, remote: string) => {
    dispatch(thunks.cloneRepo(local, remote));
  };

  return {
    mountWallet,
    killWalletApi,
    startWalletApi,
    statusFetcher,
    generateSeed,
    restoreWallet,
    clearSeed2Validation,
    validate,
    cloneRepo
  };
};

export default useWalletAction;
