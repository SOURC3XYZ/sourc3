import { AppThunkDispatch } from '@libs/redux';
import {
  BeamApiRes, CallApiProps, CallBeamApi, CallIPCType, EventResult, IPCResult
} from '@types';
import {
  thunkCatch,
  ActionCreators, outputParser, RequestSchema, AC, RC
} from '@libs/action-creators';

type HelperCallbackType<T, C> = C extends ActionCreators
  ? (output: BeamApiRes<IPCResult<T>>) => ActionCreators
  : (output: BeamApiRes<IPCResult<T>>) => void;

// export function apiEventManager(dispatch: AppThunkDispatch) {
//   return function ({ result }:BeamApiRes<EventResult>) {
//     const isInSync = !result.is_in_sync
//     || result.tip_height !== result.current_height;
//     if (isInSync) return;
//     // we're not in sync, wait

//     dispatch(thunks.getAllRepos('all'));
//     dispatch(thunks.getOrganizations());
//     dispatch(thunks.getProjects());
//     dispatch(thunks.getWalletStatus());
//     dispatch(thunks.getTxList());
//   };
// }

export const desktopCall = (callIPC: CallIPCType) => {
  const get = async <T>(
    url:string,
    dispatch: AppThunkDispatch,
    callback: HelperCallbackType<T, ActionCreators | void>,
    noDispatch?: boolean
  ) => {
    try {
      const data = await callIPC(url, 'get', {}) as BeamApiRes<IPCResult<T>>;
      if (!data) throw new Error('main process call failed');
      if (noDispatch) return callback(data);
      return dispatch(
        callback(data) as ReturnType<HelperCallbackType<T, ActionCreators>>
      );
    } catch (error) { return thunkCatch(error, dispatch); }
  };

  return [get];
};

export const contractCall = (callApi: CallBeamApi) => {
  async function getOutput<T>(
    props: CallApiProps<RequestSchema['params']>,
    dispatch: AppThunkDispatch,
    isContractInit = false
  ) {
    const res = await callApi({ ...props, isContractInit });
    return outputParser<T>(res, dispatch);
  }

  const contractQuery = async <T>(
    dispatch: AppThunkDispatch,
    action: RequestSchema,
    callback: (output: T) => ActionCreators,
    isContract = false
  ) => {
    try {
      const output = await getOutput<T>(action, dispatch, isContract);
      if (output) dispatch(callback(output as T));
    } catch (error) { thunkCatch(error, dispatch); }
  };

  const contractMutation = async (dispatch: AppThunkDispatch, action: RequestSchema) => {
    try {
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

export const apiManagerHelper = (callback: () => void) => ({ result }:BeamApiRes<EventResult>) => {
  const isInSync = !result.is_in_sync
    || result.tip_height !== result.current_height;
  if (isInSync) return;
  // we're not in sync, wait
  callback();
};
