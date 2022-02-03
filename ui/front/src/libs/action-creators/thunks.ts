import wasm from '@assets/app.wasm';
import { BeamAPI, WasmWallet } from '@libs/beam';
import { CONTRACT } from '@libs/constants';
import { AppThunkDispatch, RootState } from '@libs/redux';
import { hexParser, treeDataMaker, updateTreeData } from '@libs/utils';
import * as T from '@types';
import { ContractResponse, RepoListType } from '@types';
import { batch } from 'react-redux';
import axios from 'axios';
import { AC } from './action-creators';
import batcher from './batcher';
import { repoReq } from './repo-response-handlers';
import { RC, RequestCreators } from './request-creators';
import { parseToBeam, parseToGroth } from '../utils/string-handlers';
import { errorHandler, outputParser } from './error-handlers';

const beam = new BeamAPI<RequestCreators['params']>(
  CONTRACT.CID, `${CONTRACT.HOST}/beam`
);

const wallet = new WasmWallet();

const messageBeam = {
  type: 'create_beam_api',
  apiver: 'current',
  apivermin: '',
  appname: 'BEAM NFT-GALLERY'
};

const headers = { 'Content-Type': 'application/json' };

export const thunks = {
  mountWallet: () => async (dispatch: AppThunkDispatch) => {
    await wallet.mount(window.BeamModule);
    dispatch(AC.setWalletConnection(true));
  },

  generateSeed: () => async (dispatch: AppThunkDispatch) => {
    dispatch(AC.setGeneratedSeed(wallet.generateSeed()));
  },

  sendParams2Service: (
    seed: string[], pass:string, callback: (str:'ok' | 'fail') => void
  ) => async () => {
    const body = {
      seed: `${seed.join(';')};`,
      password: pass
    };
    const url = `${CONTRACT.HOST}/wallet/restore`;
    try {
      await axios.post(url, body, { headers });
      callback('ok');
    } catch (error) {
      callback('fail');
    }
  },

  startWalletApi: (
    password: string,
    resolve: PromiseArg<string>,
    reject: PromiseArg<string>
  ) => async () => {
    const url = `${CONTRACT.HOST}/wallet/start`;
    try {
      const data = await axios.post(url, { password }, { headers });
      resolve(data.statusText);
    } catch (error) {
      const { message } = error as Error;
      reject(message);
    }
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
    } catch (error) {
      const { message } = error as Error;
      errorHandler({ message }, dispatch);
    }
  },

  connectBeamApi:
    (someMessage = messageBeam) => async (dispatch: AppThunkDispatch) => {
      try {
        await beam.loadAPI(someMessage);
        await beam.initContract(wasm);
        const res = await beam.callApi(RC.zeroMethodCall());
        const output = outputParser<
        ContractResponse>(<T.BeamApiRes>res, dispatch);
        if (output) dispatch(AC.setIsConnected(true));
      } catch (error) {
        const { message } = error as Error;
        errorHandler({ message }, dispatch);
      }
    },

  getAllRepos: (
    type:RepoListType, resolve?: () => void
  ) => async (dispatch: AppThunkDispatch) => {
    try {
      const res = await beam.callApi(RC.getAllRepos(type));
      const output = outputParser<T.ReposResponse>(<T.BeamApiRes>res, dispatch);
      if (output) dispatch(AC.setRepos(output.repos));
      if (resolve) resolve();
    } catch (error) {
      const { message } = error as Error;
      errorHandler({ message }, dispatch);
    }
  },

  checkTxStatus:
    (
      callback: T.SetPropertiesType<T.TxResponse>
    ) => () => (res: T.BeamApiRes) => {
      callback({
        message: res.result.comment,
        status_string: res.result.status_string
      });
    },

  startTx: () => (dispatch: AppThunkDispatch) => (res: T.BeamApiRes) => {
    dispatch(AC.setTx(res.result.txid));
  },

  getTxStatus:
    (txId: string, callback: T.SetPropertiesType<T.TxResponse>) => async () => {
      const res = await beam.callApi(RC.getTxStatus(txId)) as T.BeamApiRes;
      if (res.result) {
        callback({
          message: res.result.comment,
          status_string: res.result.status_string
        });
      }
    },

  repoGetMeta: (id: number) => async (dispatch: AppThunkDispatch) => {
    try {
      const res = await beam.callApi(RC.repoGetMeta(id)) as T.BeamApiRes;
      const output = outputParser<
      T.RepoMetaResponse>(<T.BeamApiRes>res, dispatch);
      if (output) dispatch(AC.setRepoMeta(output.objects));
    } catch (error) {
      const { message } = error as Error;
      errorHandler({ message }, dispatch);
    }
  },

  getRepo: (
    id: T.RepoId, resolve?: () => void
  ) => async (dispatch: AppThunkDispatch) => {
    const chain = await repoReq(id, beam);
    batcher(dispatch, chain);
    if (resolve) resolve();
  },

  getCommit: (
    obj_id: T.CommitHash, repo_id: T.RepoId
  ) => async (dispatch: AppThunkDispatch) => {
    dispatch(AC.setTreeData([]));
    const res = await beam
      .callApi(RC.repoGetCommit(repo_id, obj_id)) as T.BeamApiRes;
    if (res.result?.output) {
      const output = JSON.parse(res.result.output) as T.RepoCommitResponse;
      batch(async () => {
        dispatch(AC.setCommitData(output.commit));
        dispatch(AC.setCommitHash(obj_id));
        await dispatch(thunks.getTree({
          id: repo_id, oid: output.commit.tree_oid
        }));
      });
    }
  },

  getTree: (
    {
      id, oid, key, resolve
    }: T.UpdateProps
  ) => async (dispatch: AppThunkDispatch, getState: () => RootState) => {
    const { repo: { tree } } = getState();
    const res = await beam
      .callApi(RC.repoGetTree(id, oid)) as T.BeamApiRes;
    if (res.result?.output) {
      const output = JSON.parse(res.result.output) as T.RepoTreeResponse;
      if (!output.error) {
        const updated = updateTreeData(
          tree, treeDataMaker(output.tree?.entries, key), key
        );
        dispatch(AC.setTreeData(updated));
      }
      if (resolve) resolve();
    }
  },

  createRepos: (resp_name: string) => async (dispatch: AppThunkDispatch) => {
    const res = (await beam.callApi(RC.createRepos(resp_name))) as T.BeamApiRes;
    if (res.result?.raw_data) {
      const tx = (await beam.callApi(
        RC.startTx(res.result.raw_data)
      )) as T.BeamApiRes;
      if (tx.result?.txid) {
        dispatch(AC.setTx(tx.result.txid));
      }
    }
  },

  deleteRepos: (delete_repo: number) => async (dispatch: AppThunkDispatch) => {
    const res = await beam.callApi(RC.deleteRepos(delete_repo)) as T.BeamApiRes;
    if (res.result?.raw_data) {
      const tx = (await beam.callApi(
        RC.startTx(res.result.raw_data)
      )) as T.BeamApiRes;
      if (tx.result?.txid) {
        dispatch(AC.setTx(tx.result.txid));
      }
    }
  },

  getTextData: (
    repoId: T.RepoId, oid: T.TreeElementOid, resolve?: () => void
  ) => async (dispatch: AppThunkDispatch) => {
    const res = await beam
      .callApi(RC.getData(repoId, oid)) as T.BeamApiRes;
    if (res.result?.output) {
      const output = JSON.parse(res.result.output) as T.ObjectDataResponse;
      dispatch(AC.setFileText(hexParser(output.object_data)));
    }
    if (resolve) resolve();
  },

  getWalletStatus: () => async (dispatch: AppThunkDispatch) => {
    const res = (await beam.callApi(RC.getWalletStatus())) as T.BeamApiRes;
    if (res && !res.error) {
      dispatch(AC.setWalletStatus(parseToBeam(res.result.available)));
    }
  },

  getWalletAddressList: () => async (dispatch: AppThunkDispatch) => {
    const res = (await beam.callApi(
      RC.getWalletAddressList()
    )) as { error: any, result: any[] };
    if (res && !res.error && res.result) {
      dispatch(AC.setWalletAddressList(res.result[0].address));
      console.log(res.result[0].address);
    } // TODO: Jenk typing the answer from the api
  },

  setWalletSendBeam: (value: number, from: string,
    address:string,
    comment:string) => async (dispatch: AppThunkDispatch) => {
    const res = (await beam.callApi(
      RC.setWalletSendBeam(parseToGroth(Number(value)), from,
        address,
        comment)
    )) as T.BeamApiRes;
    if (res.result?.txId && !res.error) {
      dispatch(AC.setTx(res.result.txId));
    }
  }
};
