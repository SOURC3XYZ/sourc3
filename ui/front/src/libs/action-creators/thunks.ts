import wasm from '@assets/app.wasm';
import { BeamAPI } from '@libs/beam';
import { CONTRACT } from '@libs/constants';
import { AppThunkDispatch, RootState } from '@libs/redux';
import { hexParser, treeDataMaker, updateTreeData } from '@libs/utils';
import * as T from '@types';
import { RepoListType } from '@types';
import { batch } from 'react-redux';
import { AC } from './action-creators';
import batcher from './batcher';
import { repoReq } from './repo-response-handlers';
import { RC, RequestCreators } from './request-creators';
import { parseToBeam, parseToGroth } from '../utils/string-handlers';

const beam = new BeamAPI<RequestCreators['params']>(
  CONTRACT.CID, CONTRACT.HOST
);

const messageBeam = {
  type: 'create_beam_api',
  apiver: 'current',
  apivermin: '',
  appname: 'BEAM NFT-GALLERY'
};

export const thunks = {
  connectBeamApi:
    (message = messageBeam) => async (dispatch: AppThunkDispatch) => {
      await beam.loadAPI(message);
      await beam.initContract(wasm);
      const res = (await beam.callApi(RC.zeroMethodCall())) as T.BeamApiRes;
      if (res && !res.error) {
        dispatch(AC.setIsConnected(true));
      }
    },

  getAllRepos: (
    type:RepoListType, resolve?: () => void
  ) => async (dispatch: AppThunkDispatch) => {
    const res = (await beam.callApi(RC.getAllRepos(type))) as T.BeamApiRes;
    if (res.result?.output) {
      const output = JSON.parse(res.result.output) as T.ReposResponse;
      dispatch(AC.setRepos(output.repos));
    }
    if (resolve) resolve();
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
      const res = (await beam.callApi(RC.getTxStatus(txId))) as T.BeamApiRes;
      if (res.result) {
        callback({
          message: res.result.comment,
          status_string: res.result.status_string
        });
      }
    },

  repoGetMeta: (id: number) => async (dispatch: AppThunkDispatch) => {
    const res = (await beam.callApi(RC.repoGetMeta(id))) as T.BeamApiRes;
    if (res.result?.output) {
      const output = JSON.parse(res.result.output) as T.RepoMetaResponse;
      dispatch(AC.setRepoMeta(output.objects));
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
    const res = (await beam.callApi(RC.getWalletAddressList())) as T.BeamApiRes;
    if (res && !res.error) {
      dispatch(AC.setWalletAddressList(res.result[0].address));
      console.log(res.result[0].address);
    }
  },

  setWalletSendBeam: (value: number, from: string,
    address:string,
    comment:string) => async (dispatch: AppThunkDispatch) => {
    const res = (await beam.callApi(RC.setWalletSendBeam(parseToGroth(value), from,
      address,
      comment))) as T.BeamApiRes;
    if (res.result?.txId && !res.error) {
      dispatch(AC.setTx(res.result.txId));
    }
  }
};
