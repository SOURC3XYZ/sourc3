import wasm from '@assets/app.wasm';
import { BeamAPI } from '@libs/beam';
import { CONTRACT } from '@libs/constants';
import {
  BeamApiRes,
  ReposResponse,
  SetPropertiesType,
  TxResponse
} from '@types';
import { AppThunkDispatch } from '../store';
import { AC } from './action-creators';
import { RequestCreators, RC } from './request-creators';

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
      const res = (await beam.callApi(RC.zeroMethodCall())) as BeamApiRes;
      if (res && !res.error) {
        dispatch(AC.setIsConnected(true));
      }
    },

  getAllRepos: () => async (dispatch: AppThunkDispatch) => {
    const res = (await beam.callApi(RC.getAllRepos())) as BeamApiRes;
    if (res.result?.output) {
      const output = JSON.parse(res.result.output) as ReposResponse;
      dispatch(AC.setRepos(output.repos));
    }
  },

  checkTxStatus:
    (callback: SetPropertiesType<TxResponse>) => () => (res: BeamApiRes) => {
      callback({
        message: res.result.comment,
        status_string: res.result.status_string
      });
    },

  startTx: () => (dispatch: AppThunkDispatch) => (res: BeamApiRes) => {
    dispatch(AC.setTx(res.result.txid));
  },

  getTxStatus:
    (txId: string, callback: SetPropertiesType<TxResponse>) => async () => {
      const res = (await beam.callApi(RC.getTxStatus(txId))) as BeamApiRes;
      if (res.result) {
        callback({
          message: res.result.comment,
          status_string: res.result.status_string
        });
      }
    },

  createRepos: (resp_name: string) => async (dispatch: AppThunkDispatch) => {
    console.log(resp_name);
    const res = (await beam.callApi(RC.createRepos(resp_name))) as BeamApiRes;
    if (res.result?.raw_data) {
      const tx = (await beam.callApi(
        RC.startTx(res.result.raw_data)
      )) as BeamApiRes;
      if (tx.result?.txid) {
        dispatch(AC.setTx(tx.result.txid));
      }
    }
  }
  // deleteRepos: () => async (dispatch: AppThunkDispatch) => {
  //   const res = await beam.callApi(RC.createRepos(resp_name)) as BeamApiRes;
  //   console.log(res)
  // }
};
