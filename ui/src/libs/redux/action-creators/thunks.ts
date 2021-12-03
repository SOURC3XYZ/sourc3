import wasm from '@assets/app.wasm';
import { BeamAPI } from '@libs/beam';
import { CONTRACT } from '@libs/constants';
import { BeamApiRes, ReposResponse } from '@types';
import { AppThunkDispatch } from '../store';
import { RequestCreators, RC } from './request-creators';
import AC from './action-creators';

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
      const res = await beam.callApi(RC.zeroMethodCall()) as BeamApiRes;
      if (res && !res.error) { dispatch(AC.setIsConnected(true)); }
    },

  getAllRepos:
    () => async (dispatch: AppThunkDispatch) => {
      const res = await beam.callApi(RC.getAllRepos()) as BeamApiRes;
      if (res.result?.output) {
        const output = JSON.parse(res.result.output) as ReposResponse;
        dispatch(AC.setRepos(output.repos));
      }
    }
};
