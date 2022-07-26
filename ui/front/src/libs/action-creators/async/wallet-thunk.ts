import { CONFIG } from '@libs/constants';
import { WasmWallet } from '@libs/core';
import { CustomAction } from '@libs/redux';
import {
  CallIPCType, PromiseArg
} from '@types';
import { AC } from '../action-creators';
import { thunkCatch } from '../error-handlers';
import { desktopCall } from '../helpers';

const wallet = new WasmWallet();

export const walletThunk = (callIPC: CallIPCType) => {
  const [get] = desktopCall(callIPC);

  const getSyncStatus = (
    resolve: PromiseArg<{ status: number }>
  ):CustomAction => async (dispatch) => {
    const url = '/wallet/update';
    try {
      await get<{ status: number }>(
        url,
        dispatch,
        (data) => resolve(data.result.ipc),
        true
      );
      return;
    } catch (error) { thunkCatch(error, dispatch); }
  };

  const restoreWallet = (
    seed: string[],
    password:string,
    callback: (err?: Error) => void
  ) => async () => {
    const body = {
      seed: `${seed.join(';')};`,
      password
    };
    const restoreUrl = '/wallet/restore';
    // const startUrl = '/wallet/start';
    setTimeout(() => {
      try {
        callIPC(restoreUrl, 'post', body);
        // await callIPC(startUrl, 'post', { password });
        return callback();
      } catch (error) { return callback(error as Error); }
    }, 1000);
  };

  const startWalletApi = (
    password: string,
    callback: (err?: Error) => void
  ):CustomAction => async () => {
    const url = '/wallet/start';
    try {
      await callIPC(url, 'post', { password });
      return callback();
    } catch (error) { return callback(error as Error); }
  };

  const killBeamApi = (
    resolve?: PromiseArg<string>
  ):CustomAction => async (dispatch) => {
    const url = '/wallet/kill';
    try {
      await callIPC(url, 'delete');
      if (resolve) resolve();
      dispatch(AC.setIsConnected(false));
    } catch (error) { thunkCatch(error, dispatch); }
  };

  const mountWallet = ():CustomAction => async (dispatch) => {
    await wallet.mount();
    dispatch(AC.setWalletConnection(true));
  };

  const generateSeed = ():CustomAction => async (dispatch) => {
    dispatch(AC.setGeneratedSeed(wallet.generateSeed()));
  };

  const setSeed2Validation = ():CustomAction => async () => {};

  const validateSeed = (seed: string[]):CustomAction => async (dispatch) => {
    const errors = wallet.isAllowedSeed(seed);
    dispatch(AC.setSeed2Validation({ seed, errors }));
  };

  const getLocalRepoBranches = (local: string, remote:string):CustomAction => async (dispatch) => {
    const url = `${CONFIG.HOST}/git/init`;
    try {
      await callIPC(url, 'post', { local, remote });
    } catch (error) { thunkCatch(error, dispatch); }
  };

  const cloneRepo = (local: string, remote:string):CustomAction => async (dispatch) => {
    const url = `${CONFIG.HOST}/git/init`;
    try {
      await callIPC(url, 'post', { local, remote });
    } catch (error) { thunkCatch(error, dispatch); }
  };

  const setCommits = (local: string, remote:string):CustomAction => async (dispatch) => {
    const url = `${CONFIG.HOST}/git/init`;
    try {
      await callIPC(url, 'post', { local, remote });
    } catch (error) { thunkCatch(error, dispatch); }
  };

  return {
    getSyncStatus,
    mountWallet,
    restoreWallet,
    startWalletApi,
    killBeamApi,
    generateSeed,
    setSeed2Validation,
    validateSeed,
    getLocalRepoBranches,
    cloneRepo,
    setCommits
  };
};
