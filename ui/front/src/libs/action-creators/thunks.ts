import wasm from '@assets/app.wasm';
import { BeamAPI, WasmWallet } from '@libs/beam';
import { CONTRACT } from '@libs/constants';
import { AppThunkDispatch, RootState } from '@libs/redux';
import {
  CommitMapParser, hexParser, TreeListParser
} from '@libs/utils';
import {
  BeamApiRes,
  CallApiProps,
  ContractsResp,
  MetaHash,
  ObjectDataResp,
  PKeyRes,
  RepoId, RepoListType,
  RepoMeta,
  RepoMetaResp,
  ReposResp,
  SetPropertiesType,
  TreeElementOid,
  TxResponse,
  UpdateProps
} from '@types';
import axios from 'axios';
import { AC } from './action-creators';
import batcher from './batcher';
import { apiEventManager } from './repo-response-handlers';
import { RC, RequestCreators } from './request-creators';
import { parseToBeam, parseToGroth } from '../utils/string-handlers';
import { cbErrorHandler, outputParser, thunkCatch } from './error-handlers';

const api = new BeamAPI<RequestCreators['params']>(CONTRACT.CID);

const {
  callApi, initContract, loadAPI
} = api;

const wallet = new WasmWallet();

const messageBeam = {
  // type: 'create_sourc3_api',
  type: 'create_beam_api',
  apiver: 'current',
  apivermin: '',
  appname: 'SOURC3'
};

const headers = { 'Content-Type': 'application/json' };

async function getOutput<T>(
  props: CallApiProps<RequestCreators['params']>,
  dispatch: AppThunkDispatch
) {
  const res = await callApi(props);
  return outputParser<T>(res, dispatch);
}

export const thunks = {
  connectExtension: () => async (dispatch: AppThunkDispatch) => {
    console.log(messageBeam);
    await api.extensionConnect(messageBeam);
    const pKey = await getOutput<PKeyRes>(RC.setPublicKey(), dispatch);
    if (pKey) dispatch(AC.setPublicKey(pKey.key));
  },

  connectBeamApi:
    (apiHost?:string) => async (dispatch: AppThunkDispatch) => {
      try {
        await loadAPI(apiEventManager(dispatch), apiHost);
        await initContract(wasm);
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
        }
      } catch (error) { thunkCatch(error, dispatch); }
    },

  mountWallet: () => async (dispatch: AppThunkDispatch) => {
    await wallet.mount();
    dispatch(AC.setWalletConnection(true));
  },

  getLocalRepoBranches: (
    local: string, remote:string
  ) => async (dispatch: AppThunkDispatch) => {
    const url = `${CONTRACT.HOST}/git/init`;
    try {
      await axios.post(url, { local, remote }, { headers });
    } catch (error) { thunkCatch(error, dispatch); }
  },

  cloneRepo: (
    local: string, remote:string
  ) => async (dispatch: AppThunkDispatch) => {
    const url = `${CONTRACT.HOST}/git/init`;
    try {
      await axios.post(url, { local, remote }, { headers });
    } catch (error) { thunkCatch(error, dispatch); }
  },

  setCommits: (
    local: string, remote:string
  ) => async (dispatch: AppThunkDispatch) => {
    const url = `${CONTRACT.HOST}/git/init`;
    try {
      await axios.post(url, { local, remote }, { headers });
    } catch (error) { thunkCatch(error, dispatch); }
  },

  generateSeed: () => async (dispatch: AppThunkDispatch) => {
    dispatch(AC.setGeneratedSeed(wallet.generateSeed()));
  },

  sendParams2Service: (
    seed: string[],
    pass:string,
    callback: (err?: Error) => void
  ) => async () => {
    const body = {
      seed: `${seed.join(';')};`,
      password: pass
    };
    const url = `${CONTRACT.HOST}/wallet/restore`;
    try {
      await axios.post(url, body, { headers });
      return callback();
    } catch (error) { return cbErrorHandler(error, callback); }
  },

  startWalletApi: (
    password: string,
    callback: (err?: Error) => void
  ) => async () => {
    const url = `${CONTRACT.HOST}/wallet/start`;
    try {
      await axios.post(url, { password }, { headers });
      return callback();
    } catch (error) { return cbErrorHandler(error, callback); }
  },

  validateSeed: (seed: string[]) => async (
    dispatch: AppThunkDispatch
  ) => {
    const errors = wallet.isAllowedSeed(seed);
    dispatch(AC.setSeed2Validation({ seed, errors }));
  },

  killBeamApi: (resolve?: PromiseArg<string>) => async (
    dispatch:AppThunkDispatch
  ) => {
    const url = `${CONTRACT.HOST}/wallet/kill`;
    try {
      await axios.delete(url);
      if (resolve) resolve();
      dispatch(AC.setIsConnected(false));
    } catch (error) { thunkCatch(error, dispatch); }
  },
  getAllRepos: (
    type:RepoListType, resolve?: () => void
  ) => async (dispatch: AppThunkDispatch) => {
    try {
      const action = RC.getAllRepos(type);
      const output = await getOutput<ReposResp>(action, dispatch);
      if (output) dispatch(AC.setRepos(output.repos));
      if (resolve) resolve();
    } catch (error) { thunkCatch(error, dispatch); }
  },

  checkTxStatus:
    (callback: SetPropertiesType<TxResponse>) => () => (
      { result: { comment, status_string } }: BeamApiRes
    ) => {
      callback({
        message: comment,
        status_string
      });
    },

  startTx: () => (dispatch: AppThunkDispatch) => (res: BeamApiRes) => {
    dispatch(AC.setTx(res.result.txid));
  },

  getTxStatus:
    (txId: string,
      callback: SetPropertiesType<TxResponse>) => async (
      dispatch: AppThunkDispatch
    ) => {
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

  // repoGetMeta: (id: number) => async (dispatch: AppThunkDispatch) => {
  //   try {
  //     const action = RC.repoGetMeta(id);
  //     const output = await getOutput<RepoMetaResp>(action, dispatch);
  //     if (output) dispatch(AC.setRepoMeta(output.objects));
  //   } catch (error) { thunkCatch(error, dispatch); }
  // },

  getRepo: (
    id: RepoId, resolve?: () => void
  ) => async (dispatch: AppThunkDispatch) => {
    try {
      const metas = new Map<MetaHash, RepoMeta>();
      const metaArray = await getOutput<RepoMetaResp>(
        RC.repoGetMeta(id), dispatch
      );
      if (metaArray) {
        metaArray.objects.forEach((el) => {
          metas.set(el.object_hash, el);
        });
      }
      const commitTree = await new CommitMapParser({
        id, metas, api, expect: 'commit'
      })
        .buildCommitTree();

      batcher(dispatch, [
        AC.setRepoMeta(metas),
        AC.setRepoId(id),
        AC.setRepoMap(commitTree),
        AC.setTreeData(null)
      ]);
      if (resolve) resolve();
    } catch (error) { thunkCatch(error, dispatch); }
  },

  getTree: (
    {
      id, oid, key, resolve
    }: UpdateProps
  ) => async (dispatch: AppThunkDispatch, getState: () => RootState) => {
    try {
      const { repo: { tree, repoMetas: metas } } = getState();
      const parserProps = {
        id, metas, api, key
      };
      const updated = await new TreeListParser(
        { ...parserProps, expect: 'tree' }
      ).getTree(oid, tree);
      dispatch(AC.setTreeData(updated));
      if (resolve) resolve();
    } catch (error) { thunkCatch(error, dispatch); }
  },

  createRepos: (resp_name: string) => async (dispatch: AppThunkDispatch) => {
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

  deleteRepos: (delete_repo: number) => async (dispatch: AppThunkDispatch) => {
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
    repoId: RepoId, oid: TreeElementOid, resolve?: () => void
  ) => async (dispatch: AppThunkDispatch) => {
    try {
      const action = RC.getData(repoId, oid);
      const output = await getOutput<ObjectDataResp>(action, dispatch);
      if (output) dispatch(AC.setFileText(hexParser(output.object_data)));
      if (resolve) resolve();
    } catch (error) { thunkCatch(error, dispatch); }
  },

  getWalletStatus: () => async (dispatch: AppThunkDispatch) => {
    try {
      const res = await callApi(RC.getWalletStatus());
      if (res && !res.error) {
        return dispatch(AC.setWalletStatus(parseToBeam(res.result.available)));
      } throw new Error('unable to get wallet status');
    } catch (error) { return thunkCatch(error, dispatch); }
  },

  getWalletAddressList: () => async (dispatch: AppThunkDispatch) => {
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

  setWalletSendBeam: (value: number, from: string,
    address:string,
    comment:string) => async (dispatch: AppThunkDispatch) => {
    try {
      const res = await callApi(
        RC.setWalletSendBeam(parseToGroth(Number(value)), from,
          address,
          comment)
      );
      if (res.result?.txId && !res.error) {
        return dispatch(AC.setTx(res.result.txId));
      } throw new Error('failed to send beam');
    } catch (error) { return thunkCatch(error, dispatch); }
  },
  getPublicKey: () => async (dispatch: AppThunkDispatch) => {
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
  }
};
