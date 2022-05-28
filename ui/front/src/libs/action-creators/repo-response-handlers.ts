import { AppThunkDispatch } from '@libs/redux';
import {
  BeamApiRes, CallApiProps, CallBeamApi, EventResult
} from '@types';
import {
  thunkCatch,
  ActionCreators, outputParser, RequestSchema, thunks, AC, RC
} from '@libs/action-creators';

export function apiEventManager(dispatch: AppThunkDispatch) {
  return function ({ result }:BeamApiRes<EventResult>) {
    const isInSync = !result.is_in_sync
    || result.tip_height !== result.current_height;
    if (isInSync) return;
    // we're not in sync, wait

    dispatch(thunks.getAllRepos('all'));
    dispatch(thunks.getOrganizations());
    dispatch(thunks.getProjects());
    dispatch(thunks.getWalletStatus());
    dispatch(thunks.getTxList());
  };
}

export const contractCall = (callApi: CallBeamApi) => {
  async function getOutput<T>(
    props: CallApiProps<RequestSchema['params']>,
    dispatch: AppThunkDispatch
  ) {
    const res = await callApi(props);
    return outputParser<T>(res, dispatch);
  }

  const contractQuery = async <T>(
    dispatch: AppThunkDispatch,
    action: RequestSchema,
    callback: (output: T) => ActionCreators
  ) => {
    try {
      const output = await getOutput<T>(action, dispatch);
      if (output) dispatch(callback(output as T));
    } catch (error) { thunkCatch(error, dispatch); }
  };

  const contractMutation = async (dispatch: AppThunkDispatch, action: RequestSchema) => {
    try {
      console.log('hui');
      const res = await callApi(action);
      if (res.result?.raw_data) {
        const tx = await callApi(RC.startTx(res.result.raw_data));
        if (tx.result?.txid) {
          return dispatch(AC.setTx(tx.result.txid));
        }
      }
      throw new Error('repo delete failed');
    } catch (error) { return thunkCatch(error, dispatch); }
  };
  return [contractQuery, contractMutation, getOutput] as const;
};
