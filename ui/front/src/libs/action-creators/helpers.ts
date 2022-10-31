import { AppThunkDispatch } from '@libs/redux';
import {
  BeamApiRes,
  CallApiProps,
  CallBeamApi,
  CallIPCType,
  ContractResp,
  ContractResult,
  EventResult,
  IPCResult
} from '@types';
import {
  thunkCatch,
  ActionCreators, RequestSchema, AC, RC, errorHandler
} from '@libs/action-creators';
import batcher from './batcher';

type HelperCallbackType<T, C> = C extends ActionCreators
  ? (output: BeamApiRes<IPCResult<T>>) => ActionCreators
  : (output: BeamApiRes<IPCResult<T>>) => void;

export function outputParser<T extends ContractResp>(
  res: BeamApiRes<ContractResult>,
  dispatch?: AppThunkDispatch
) {
  try {
    if (res.error) return errorHandler(res.error, dispatch);
    if (res.result.output) {
      const output = JSON.parse(res.result.output) as T;
      if (output.error) {
        return errorHandler({ message: output.error }, dispatch);
      }
      return output;
    } throw new Error('no output');
  } catch (error) {
    const { message } = error as Error;
    errorHandler({ message }, dispatch);
    return undefined;
  }
}

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

export const contractCall = (callApi: CallBeamApi<RequestSchema['params']>) => {
  async function getOutput<T>(
    props: CallApiProps<RequestSchema['params']>,
    dispatch: AppThunkDispatch,
    isContractInit = false
  ) {
    const res = await callApi({ ...props, isContractInit });
    return outputParser<T extends ContractResp ? T : any>(res, dispatch);
  }

  const contractQuery = async <T, K = any>(
    dispatch: AppThunkDispatch,
    action: RequestSchema,
    callback: (output: T) => K,
    isContract = false
  ):Promise<K> => {
    try {
      const output = await getOutput<T>(action, dispatch, isContract);
      if (output) {
        const actions = callback(output as T);
        const isArray = typeof actions === 'object' && actions instanceof Array && actions.length;
        if (isArray) batcher(dispatch, actions);
        return actions;
      } throw new Error('contract error');
    } catch (error) { return thunkCatch(error, dispatch); }
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
