import wasm from '@assets/app.wasm';
import { BeamAPI } from '@libs/beam';
import { CONTRACT } from '@libs/constants';
import { AppThunkDispatch, RootState } from '@libs/redux';
import { treeDataMaker, updateTreeData } from '@libs/utils';
import * as T from '@types';
import { AC } from './action-creators';
import { RC, RequestCreators } from './request-creators';

const beam = new BeamAPI<RequestCreators['params']>(CONTRACT.CID);

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

  getAllRepos: () => async (dispatch: AppThunkDispatch) => {
    const res = (await beam.callApi(RC.getAllRepos())) as T.BeamApiRes;
    if (res.result?.output) {
      const output = JSON.parse(res.result.output) as T.ReposResponse;
      dispatch(AC.setRepos(output.repos));
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
    (
      txId: string, callback: T.SetPropertiesType<T.TxResponse>
    ) => async () => {
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

  repoGetRefs: (id: T.RepoId) => async (dispatch: AppThunkDispatch) => {
    const res = (await beam.callApi(RC.repoGetRefs(id))) as T.BeamApiRes;
    if (res.result?.output) {
      const output = JSON.parse(res.result.output) as T.RepoRefsResponse;
      dispatch(AC.setRepoRefs(output.refs));
    }
  },

  getCommit: (
    obj_id: T.CommitHash, repo_id: T.RepoId
  ) => async (dispatch: AppThunkDispatch) => {
    const res = await beam
      .callApi(RC.repoGetCommit(repo_id, obj_id)) as T.BeamApiRes;
    if (res.result?.output) {
      const output = JSON.parse(res.result.output) as T.RepoCommitResponse;
      dispatch(AC.setCommitData(output.commit));
    }
  },

  getTree: (
    {
      id, oid, key, resolve
    }: T.UpdateProps
  ) => async (dispatch: AppThunkDispatch, getState: () => RootState) => {
    const { repo: { tree } } = getState();
    const res = await beam.callApi(
      RC.repoGetTree(id, oid)
    ) as T.BeamApiRes;
    if (res.result?.output) {
      const output = JSON.parse(res.result.output) as T.RepoTreeResponse;
      const updated = updateTreeData(
        tree, treeDataMaker(output.tree.entries, key), key
      );
      dispatch(AC.setTreeData(updated));
      if (resolve) resolve();
    }
  }
};
