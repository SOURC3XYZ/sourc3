import {
  exportOwnerKey,
  killApiServer,
  removeWallet, restoreExistedWallet, runWalletApi
} from './wallet.repository';

export const removeExistedWallet = async () => {
  const isWalletRemoved = await removeWallet();
  return isWalletRemoved;
};

export const restoreWallet = async (seed:string, password: string) => {
  await removeWallet();
  const isRestored = await new Promise(
    (resolve) => { restoreExistedWallet(seed, password, resolve); }
  );
  return isRestored;
};

export const enterUser = async (password:string) => {
  const getOwnerKey:string | null = await new Promise(
    (resolve) => { exportOwnerKey(password, resolve); }
  );
  if (getOwnerKey) {
    const runWallet = await new Promise(
      (resolve) => { runWalletApi(password, resolve); }
    );
    return runWallet;
  } return null;
};

export const killApi = async () => killApiServer();
