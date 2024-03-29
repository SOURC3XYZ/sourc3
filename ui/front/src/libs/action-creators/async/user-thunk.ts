import {
  BeamApiContext,
  BeamApiRes, ContractsResp, IProfile,
  NotificationPlacement,
  PKeyRes,
  PromiseArg,
  SetPropertiesType,
  TxResponse,
  TxResult
} from '@types';
import { notification } from 'antd';
import { CONFIG, ToastMessages } from '@libs/constants';

import { CustomAction } from '@libs/redux';
import { parseToBeam, parseToGroth } from '@libs/utils';
import axios from 'axios';
import { HOST } from '@components/shared/git-auth/profile/constants';
import { AC } from '../action-creators';
import { thunkCatch } from '../error-handlers';
import { RC } from '../request-schemas';
import { contractCall } from '../helpers';
import batcher from '../batcher';

export const userThunk = ({
  callApi,
  setIsConnected,
  isWebHeadless,
  connectExtension: extensionConnect
}: NonNullable<BeamApiContext>) => {
  const [query] = contractCall(callApi);

  const checkTxStatus = (callback: SetPropertiesType<TxResponse>):CustomAction => () => (
    { result }: BeamApiRes<TxResult>
  ) => {
    callback({
      ...result
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
          ...res.result
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
      const activeUser = await extensionConnect(dispatch);
      const getContract = query<ContractsResp>(
        dispatch,
        RC.viewContracts(),
        (output) => {
          const found = output.contracts.find((el) => el.cid === CONFIG.CID);
          if (!found) throw new Error(`no specified cid (${CONFIG.CID})`);
          return found;
        },
        true
      );
      const getPkey = query<PKeyRes>(
        dispatch,
        RC.getPublicKey(),
        async (output) => query<IProfile>(
          dispatch,
          RC.getUser(output.key),
          (profile) => ({ key: output.key, profile })
        )
      );

      const [isFound, { key, profile }] = await Promise.all([getContract, getPkey]);

      batcher(
        dispatch,
        [
          AC.setUsers(activeUser),
          AC.setIsConnected(isFound),
          AC.setPublicKey(key),
          AC.setViewUser(profile)
        ]
      );

      await callApi(RC.subUnsub()); // subscribe to api events
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
      if (!isWebHeadless || !setIsConnected) throw new Error('there is not web api');
      await setIsConnected(dispatch);
      await query<ContractsResp>(dispatch, RC.viewContracts(), (output) => {
        const found = output.contracts.find((el) => el.cid === CONFIG.CID);
        if (!found) throw new Error(`no specified cid (${CONFIG.CID})`);
        return [AC.setIsConnected(!!found)];
      }, true);

      await axios({
        method: 'get',
        url: `${HOST}/user`,
        withCredentials: false,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${window.localStorage.getItem('token')}`
        }
      })
        .then((res) => {
          dispatch(AC.getAuthGitUser(res));
        })
        .catch((err) => (console.log(err)));

      await callApi(RC.subUnsub()); // subscribe to api events

      notification.open({
        message: ToastMessages.HEADLESS_CONNECTED,
        placement: 'bottomRight' as NotificationPlacement,
        style: { fontWeight: 600 }
      });
    } catch (error) { thunkCatch(error, dispatch); }
  };

  const connectElectronApi = ():CustomAction => async (dispatch) => {
    try {
      if (!setIsConnected) throw new Error('there is not web api');
      await setIsConnected(dispatch);

      await callApi(RC.subUnsub());
      // subscribe to api events
    } catch (error) { thunkCatch(error, dispatch); }
  };

  const getWalletAddressList = ():CustomAction => async (dispatch) => {
    try {
      const res = await callApi(
        RC.getWalletAddressList()
      ) as unknown as { error: any, result: any[] };
      if (res && !res.error && res.result) {
        return dispatch(AC.setWalletAddressList(res.result[0].address));
      } // TODO: Jenk typing the answer from the api
      throw new Error('unable to get wallet adress list');
    } catch (error) { return thunkCatch(error, dispatch); }
  };

  const createAddress = (
    message: string,
    resolve: PromiseArg<{ address: string }>
  ):CustomAction => async (dispatch) => {
    try {
      const res = await callApi(
        RC.createAddress(message)
      ) as unknown as { error: any, result: string };
      if (res && !res.error && res.result) {
        return resolve({ address: res.result });
      } throw new Error('unable to ');
    } catch (error) { return thunkCatch(error, dispatch); }
  };

  const setWalletSendBeam = (
    value: number,
    address:string,
    comment:string,
    offline = false
  ):CustomAction => async (dispatch) => {
    try {
      const res = await callApi(
        RC.setWalletSendBeam(
          parseToGroth(Number(value)),
          address,
          comment,
          offline
        )
      );
      if (res.result?.txId && !res.error) {
        return dispatch(AC.setTx(res.result.txId));
      } throw new Error('failed to send beam');
    } catch (error) { return thunkCatch(error, dispatch); }
  };

  const getWalletStatus = ():CustomAction => async (dispatch) => {
    try {
      const res = await callApi(RC.getWalletStatus());
      if (res && !res.error) {
        return dispatch(AC.setWalletStatus(parseToBeam(res.result.available)));
      } throw new Error('unable to get wallet status');
    } catch (error) { return thunkCatch(error, dispatch); }
  };

  return {
    getWalletAddressList,
    getWalletStatus,
    connectElectronApi,
    setWalletSendBeam,
    connectExtension,
    connectBeamApi,
    checkTxStatus,
    createAddress,
    getTxStatus,
    startTx
  };
};
