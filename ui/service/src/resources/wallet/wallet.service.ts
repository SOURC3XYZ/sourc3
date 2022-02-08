/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  checkRunningApi,
  exportOwnerKey,
  killApiServer,
  restoreExistedWallet,
  runWalletApi,
  startBeamNode
} from './wallet.repository';

type ProcessStatus = {
  isOk: boolean,
  message: string
};

export const checkApi = () => checkRunningApi();

export const restoreWallet = async (
  seed: string,
  password: string
): Promise<ProcessStatus> => {
  try {
    const isRestored = await restoreExistedWallet(seed, password);
    return { isOk: true, message: isRestored };
  } catch (error) {
    const { message } = error as Error;
    return { isOk: false, message };
  }
};

export const enterUser = async (password: string): Promise<ProcessStatus> => {
  try {
    const ownerKey = await exportOwnerKey(password);
    console.log('owner key: ', ownerKey);
    const nodeProcess = await startBeamNode(ownerKey, password);
    const runWallet = await runWalletApi(password, nodeProcess);
    return { isOk: true, message: runWallet };
  } catch (error) {
    const { message } = error as Error;
    return { isOk: false, message };
  }
};

export const killApi = async () => killApiServer();
