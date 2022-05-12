/* eslint-disable @typescript-eslint/no-unused-vars */
import { Seed } from '../../entities';
import {
  checkRunningApi,
  exportOwnerKey,
  getNodeUpdate,
  killApiServer,
  restoreExistedWallet,
  runWalletApi,
  startBeamNode
} from './wallet.repository';

type ProcessStatus = {
  isOk: boolean,
  message: string,
  restored?: Seed
};

export const checkApi = () => checkRunningApi();

export const restoreWallet = async (
  seed: string,
  password: string
): Promise<ProcessStatus> => {
  try {
    const restored = await restoreExistedWallet(seed, password);
    return {
      restored,
      isOk: true,
      message: 'wallet successfully restored'
    } as const;
  } catch (error) {
    const { message } = error as Error;
    return { isOk: false, message } as const;
  }
};

export const getNodeUpdateService = () => getNodeUpdate();

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
