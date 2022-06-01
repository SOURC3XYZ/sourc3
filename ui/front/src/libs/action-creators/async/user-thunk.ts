import {
  BeamApiContext,
  BeamApiRes,
  NotificationPlacement,
  PKeyRes,
  SetPropertiesType,
  TxResponse,
  TxResult
} from '@types';
import { notification } from 'antd';
import { ToastMessages } from '@libs/constants';

import { CustomAction } from '@libs/redux';
import { AC } from '../action-creators';
import { thunkCatch } from '../error-handlers';
import { RC } from '../request-schemas';
import { contractCall } from '../helpers';

export const userThunk = ({
  callApi,
  setIsConnected,
  isWebHeadless,
  connectExtension: extensionConnect
}: NonNullable<BeamApiContext>) => {
  const [query] = contractCall(callApi);

  const checkTxStatus = (callback: SetPropertiesType<TxResponse>):CustomAction => () => (
    { result: { comment, status_string } }: BeamApiRes<TxResult>
  ) => {
    callback({
      message: comment,
      status_string
    });
  };

  const getTxStatus = (
    txId: string,
    callback: SetPropertiesType<TxResponse>
  ):CustomAction => async (dispatch) => {
    try {
      const res = await callApi(RC.getTxStatus(txId));
      if (res.result) {
        callback({
          message: res.result.comment,
          status_string: res.result.status_string
        });
      }
    } catch (error) { thunkCatch(error, dispatch); }
  };

  const startTx = ():CustomAction => (dispatch) => (res: BeamApiRes<TxResult>) => {
    dispatch(AC.setTx(res.result.txid));
  };

  const connectExtension = ():CustomAction => async (dispatch) => {
    try {
      if (!extensionConnect) throw new Error('there is not web api');
      await extensionConnect(dispatch);

      await callApi(RC.subUnsub()); // subscribe to api events

      await query<PKeyRes>(
        dispatch,
        RC.getPublicKey(),
        (output) => dispatch(AC.setPublicKey(output.key))
      );
    } catch (error:any) {
      notification.error({
        message: error.message,
        placement: 'bottomRight' as NotificationPlacement
      });
      thunkCatch(error, dispatch);
    }
  };

  const connectBeamApi = ():CustomAction => async (dispatch) => {
    try {
      if (!isWebHeadless) throw new Error('there is not web api');
      await setIsConnected(dispatch);

      await callApi(RC.subUnsub()); // subscribe to api events

      if (isWebHeadless()) {
        await query<PKeyRes>(
          dispatch,
          RC.getPublicKey(),
          (output) => dispatch(AC.setPublicKey(output.key))
        );
      } else {
        notification.open({
          message: ToastMessages.HEADLESS_CONNECTED,
          placement: 'bottomRight' as NotificationPlacement,
          style: { fontWeight: 600 }
        });
      }
    } catch (error) { thunkCatch(error, dispatch); }
  };

  const connectElectronApi = ():CustomAction => async (dispatch) => {
    try {
      await setIsConnected(dispatch);

      await callApi(RC.subUnsub()); // subscribe to api events

      await query<PKeyRes>(
        dispatch,
        RC.getPublicKey(),
        (output) => dispatch(AC.setPublicKey(output.key))
      );
    } catch (error) { thunkCatch(error, dispatch); }
  };

  return {
    connectElectronApi,
    connectExtension,
    connectBeamApi,
    checkTxStatus,
    getTxStatus,
    startTx
  };
};
