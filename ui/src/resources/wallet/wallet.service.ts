/* eslint-disable @typescript-eslint/no-unused-vars */
import { Seed } from '../../entities';
import {
  checkRunningApi,
  getNodeUpdate,
  importRecovery,
  killApiServer,
  recoveryDonwload,
  restoreExistedWallet,
  runWalletApi
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
    await recoveryDonwload();
    const restored = await restoreExistedWallet(seed, password);
    await importRecovery(password);
    await runWalletApi(password);

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
    const runWallet = await runWalletApi(password);
    return { isOk: true, message: runWallet };
  } catch (error) {
    const { message } = error as Error;
    return { isOk: false, message };
  }
};

export const killApi = async () => killApiServer();
