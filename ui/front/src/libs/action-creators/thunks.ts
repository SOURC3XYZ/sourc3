import wasm from '@assets/app.wasm';
import {
  BeamAPI,
  WasmWallet,
  CommitMapParser,
  TreeBlobParser,
  TreeListParser
} from '@libs/core';
import { CONTRACT, ToastMessages } from '@libs/constants';
import { AppThunkDispatch, RootState } from '@libs/redux';
import {
  BeamApiRes,
  CallApiProps,
  ContractsResp,
  IPCResult,
  MetaHash,
  NotificationPlacement,
  PKeyRes,
  PromiseArg,
  RepoId, RepoListType,
  RepoMeta,
  RepoMetaResp,
  ReposResp,
  SetPropertiesType,
  TreeElementOid,
  TxInfo,
  TxResponse,
  TxResult,
  UpdateProps
} from '@types';
import axios from 'axios';
import { notification } from 'antd';
import { AC } from './action-creators';
import batcher from './batcher';
import { apiEventManager } from './repo-response-handlers';
import { RC, RequestSchema } from './request-schemas';
import { parseToBeam, parseToGroth } from '../utils/string-handlers';
import { cbErrorHandler, outputParser, thunkCatch } from './error-handlers';

const api = new BeamAPI<RequestSchema['params']>(CONTRACT.CID);

type Thunk<T> = (...args: T[]) => (
  dispatch: AppThunkDispatch, getState: () => RootState
) => void;

type ThunkObject = {
  [key: string]: Thunk<any>
};

const {
  callApi, initContract, loadAPI, callIPC
} = api;

const wallet = new WasmWallet();

const messageBeam = {
  type: 'create_sourc3_api',
  apiver: 'current',
  apivermin: '',
  appname: 'SOURC3'
};

const headers = { 'Content-Type': 'application/json' };

async function getOutput<T>(
  props: CallApiProps<RequestSchema['params']>,
  dispatch: AppThunkDispatch
) {
  const res = await callApi(props);
  return outputParser<T>(res, dispatch);
}

export const thunks:ThunkObject = {
  connectExtension: (resolve, reject) => async (dispatch) => {
    try {
      await api.extensionConnect(messageBeam);
      if (!api.isHeadless()) {
        await initContract(wasm);
        const action = RC.viewContracts();
        const output = await getOutput<ContractsResp>(action, dispatch);
        if (output) {
          const finded = output.contracts.find((el) => el.cid === api.cid);
          if (!finded) throw new Error(`no specified cid (${api.cid})`);
          dispatch(AC.setIsConnected(Boolean(finded)));
        } // TODO: DAnik - double code
      }
      api.loadApiEventManager(apiEventManager(dispatch));
      await callApi(RC.subUnsub()); // subscribe to api events
      const pKey = await getOutput<PKeyRes>(RC.setPublicKey(), dispatch);
      if (pKey) dispatch(AC.setPublicKey(pKey.key));
      resolve();
    } catch (error) {
      reject(error);
      thunkCatch(error, dispatch);
    }
  },

  connectBeamApi:
    () => async (dispatch) => {
      try {
        if (api.isApiLoaded()) return;
        await loadAPI();
        await initContract(wasm);
        api.loadApiEventManager(apiEventManager(dispatch));
        const action = RC.viewContracts();
        const output = await getOutput<ContractsResp>(action, dispatch);
        if (output) {
          const finded = output.contracts.find((el) => el.cid === api.cid);
          if (!finded) throw new Error(`no specified cid (${api.cid})`);
          dispatch(AC.setIsConnected(Boolean(finded)));
        }
        await callApi(RC.subUnsub()); // subscribe to api events
        if (api.isDapps() || api.isElectron()) {
          const pKey = await getOutput<PKeyRes>(RC.setPublicKey(), dispatch);
          if (pKey) dispatch(AC.setPublicKey(pKey.key));
        } else {
          notification.open({
            message: ToastMessages.HEADLESS_CONNECTED,
            placement: 'bottomRight' as NotificationPlacement,
            style: { fontWeight: 600 }
          });
          api.headlessConnectedEvent();
        }
      } catch (error) { thunkCatch(error, dispatch); }
    },

  getSyncStatus: (
    resolve: PromiseArg<{ status: number }>
  ) => async (dispatch) => {
    const url = '/wallet/update';
    try {
      const data = await callIPC(url, 'get', {}) as BeamApiRes<IPCResult<{ status: number }>>;
      return resolve(data.result.ipc);
    } catch (error) { return thunkCatch(error, dispatch); }
  },

  mountWallet: () => async (dispatch) => {
    await wallet.mount();
    dispatch(AC.setWalletConnection(true));
  },

  getLocalRepoBranches: (local: string, remote:string) => async (dispatch) => {
    const url = `${CONTRACT.HOST}/git/init`;
    try {
      await axios.post(url, { local, remote }, { headers });
    } catch (error) { thunkCatch(error, dispatch); }
  },

  cloneRepo: (local: string, remote:string) => async (dispatch) => {
    const url = `${CONTRACT.HOST}/git/init`;
    try {
      await axios.post(url, { local, remote }, { headers });
    } catch (error) { thunkCatch(error, dispatch); }
  },

  setCommits: (local: string, remote:string) => async (dispatch) => {
    const url = `${CONTRACT.HOST}/git/init`;
    try {
      await axios.post(url, { local, remote }, { headers });
    } catch (error) { thunkCatch(error, dispatch); }
  },

  generateSeed: () => async (dispatch) => {
    dispatch(AC.setGeneratedSeed(wallet.generateSeed()));
  },

  sendParams2Service: (
    seed: string[],
    password:string,
    callback: (err?: Error) => void
  ) => async () => {
    const body = {
      seed: `${seed.join(';')};`,
      password
    };
    const restoreUrl = '/wallet/restore';
    const startUrl = '/wallet/start';

    try {
      await callIPC(restoreUrl, 'post', body);
      await callIPC(startUrl, 'post', { password });
      return callback();
    } catch (error) { return cbErrorHandler(error, callback); }
  },

  startWalletApi: (
    password: string,
    callback: (err?: Error) => void
  ) => async () => {
    const url = '/wallet/start';
    try {
      await callIPC(url, 'post', { password });
      return callback();
    } catch (error) { return cbErrorHandler(error, callback); }
  },

  validateSeed: (seed: string[]) => async (dispatch) => {
    const errors = wallet.isAllowedSeed(seed);
    dispatch(AC.setSeed2Validation({ seed, errors }));
  },

  killBeamApi: (resolve?: PromiseArg<string>) => async (dispatch) => {
    const url = '/wallet/kill';
    try {
      await callIPC(url, 'delete');
      if (resolve) resolve();
      dispatch(AC.setIsConnected(false));
    } catch (error) { thunkCatch(error, dispatch); }
  },
  getAllRepos: (type:RepoListType, resolve?: () => void) => async (dispatch) => {
    try {
      const action = RC.getAllRepos(type);
      const output = await getOutput<ReposResp>(action, dispatch);
      if (output) dispatch(AC.setRepos(output.repos));
      if (resolve) resolve();
    } catch (error) { thunkCatch(error, dispatch); }
  },

  checkTxStatus:
    (callback: SetPropertiesType<TxResponse>) => () => (
      { result: { comment, status_string } }: BeamApiRes<TxResult>
    ) => {
      callback({
        message: comment,
        status_string
      });
    },

  startTx: () => (dispatch) => (res: BeamApiRes<TxResult>) => {
    dispatch(AC.setTx(res.result.txid));
  },

  getTxStatus:
    (
      txId: string,
      callback: SetPropertiesType<TxResponse>
    ) => async (dispatch) => {
      try {
        const res = await callApi(RC.getTxStatus(txId));
        if (res.result) {
          callback({
            message: res.result.comment,
            status_string: res.result.status_string
          });
        }
      } catch (error) { thunkCatch(error, dispatch); }
    },

  getRepo: (
    id: RepoId,
    errHandler: (err: Error) => void,
    resolve?: () => void
  ) => async (dispatch) => {
    try {
      const { pathname } = window.location;
      const metas = new Map<MetaHash, RepoMeta>();
      const metaArray = await getOutput<RepoMetaResp>(RC.repoGetMeta(id), dispatch);
      if (metaArray) {
        metaArray.objects.forEach((el) => {
          metas.set(el.object_hash, el);
        });
      }
      const commitTree = await new CommitMapParser({
        id, metas, api, pathname, expect: 'commit'
      })
        .buildCommitTree();

      batcher(dispatch, [
        AC.setRepoMeta(metas),
        AC.setRepoId(id),
        AC.setRepoMap(commitTree),
        AC.setTreeData(null)
      ]);
      if (resolve) resolve();
    } catch (error) { errHandler(error as Error); }
  },

  getTree: ({
    id, oid, key, resolve
  }: UpdateProps, errHandler: (err: Error) => void) => async (dispatch, getState) => {
    try {
      const { pathname } = window.location;
      const { repo: { tree, repoMetas: metas } } = getState();
      const parserProps = {
        id, metas, api, key, pathname
      };
      const updated = await new TreeListParser(
        { ...parserProps, expect: 'tree' }
      ).getTree(oid, tree);
      dispatch(AC.setTreeData(updated));
      if (resolve) resolve();
    } catch (error) { errHandler(error as Error); }
  },

  createRepos: (resp_name: string) => async (dispatch) => {
    try {
      const res = await callApi(RC.createRepos(resp_name));
      if (res.result?.raw_data) {
        const tx = await callApi(RC.startTx(res.result.raw_data));
        if (tx.result?.txid) {
          dispatch(AC.setTx(tx.result.txid));
        }
      }
    } catch (error) { thunkCatch(error, dispatch); }
  },

  deleteRepos: (delete_repo: number) => async (dispatch) => {
    try {
      const res = await callApi(RC.deleteRepos(delete_repo));
      if (res.result?.raw_data) {
        const tx = await callApi(RC.startTx(res.result.raw_data));
        if (tx.result?.txid) {
          return dispatch(AC.setTx(tx.result.txid));
        }
      }
      throw new Error('repo delete failed');
    } catch (error) { return thunkCatch(error, dispatch); }
  },

  getTextData: (
    repoId: RepoId,
    oid: TreeElementOid,
    errHandler: (err: Error) => void,
    resolve?: () => void
  ) => async (dispatch, getState) => {
    try {
      const { pathname } = window.location;
      const { repo: { repoMetas: metas } } = getState();
      const parserProps = {
        id: repoId, metas, api, pathname
      };
      const output = await new TreeBlobParser(
        { ...parserProps, expect: 'blob' }
      ).parseBlob(oid);
      if (output) dispatch(AC.addFileToMap([oid, output]));
      if (resolve) resolve();
    } catch (error) { errHandler(error as Error); }
  },

  getWalletStatus: () => async (dispatch) => {
    try {
      const res = await callApi(RC.getWalletStatus());
      if (res && !res.error) {
        return dispatch(AC.setWalletStatus(parseToBeam(res.result.available)));
      } throw new Error('unable to get wallet status');
    } catch (error) { return thunkCatch(error, dispatch); }
  },

  createAddress: (
    message: string,
    resolve: PromiseArg<{ address: string }>
  ) => async (dispatch) => {
    try {
      const res = await callApi(
        RC.createAddress(message)
      ) as unknown as { error: any, result: string };
      if (res && !res.error && res.result) {
        return resolve({ address: res.result });
      } throw new Error('unable to ');
    } catch (error) { return thunkCatch(error, dispatch); }
  },

  getWalletAddressList: () => async (dispatch) => {
    try {
      const res = await callApi(
        RC.getWalletAddressList()
      ) as unknown as { error: any, result: any[] };
      if (res && !res.error && res.result) {
        return dispatch(AC.setWalletAddressList(res.result[0].address));
      } // TODO: Jenk typing the answer from the api
      throw new Error('unable to get wallet adress list');
    } catch (error) { return thunkCatch(error, dispatch); }
  },

  setWalletSendBeam: (
    value: number,
    address:string,
    comment:string,
    offline: boolean
  ) => async (dispatch) => {
    try {
      const res = await callApi(
        RC.setWalletSendBeam(
          parseToGroth(Number(value)),
          address,
          comment,
          offline
        )
      );
      if (res.result?.txId && !res.error) {
        return dispatch(AC.setTx(res.result.txId));
      } throw new Error('failed to send beam');
    } catch (error) { return thunkCatch(error, dispatch); }
  },
  getPublicKey: () => async (dispatch) => {
    try {
      const res = await callApi(
        RC.setPublicKey()
      ) as unknown as { error: any, result: any };
      if (res.result && !res.error) {
        return dispatch(AC.setPublicKey(
          JSON.parse(res.result.output).key
        ));
      } throw new Error('Failed to get public key');
    } catch (error) { return thunkCatch(error, dispatch); }
  },

  getTxList: () => async (dispatch) => {
    try {
      const res = await callApi(RC.getTxList()) as BeamApiRes<TxInfo[]>;
      if (!res.error) {
        return dispatch(AC.setTxList(res.result));
      } throw new Error('failed to send beam');
    } catch (error) { return thunkCatch(error, dispatch); }
  }
};
