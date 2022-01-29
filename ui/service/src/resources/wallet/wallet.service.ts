import {
  killApiServer,
  removeWallet, restoreExistedWallet, runWalletApi
} from './wallet.repository';

export const removeExistedWallet = async () => {
  const isWalletRemoved = await removeWallet();
  return isWalletRemoved;
};

export const restoreWallet = async (seed:string, password: string) => {
  await removeWallet();
  const restored = await new Promise(
    (resolve) => { restoreExistedWallet(seed, password, resolve); }
  );
  return restored;
};

export const enterUser = async (password:string) => {
  const isRun = await new Promise(
    (resolve) => { runWalletApi(password, resolve); }
  );
  return isRun;
};

export const killApi = async () => killApiServer();
