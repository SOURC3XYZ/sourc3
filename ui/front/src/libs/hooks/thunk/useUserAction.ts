import { useSourc3Api } from '@components/context';
import { AC } from '@libs/action-creators';
import { userThunk } from '@libs/action-creators/async';
import { useDispatch } from '@libs/redux';
import {
  PromiseArg, SetPropertiesType, TxItem, TxResponse
} from '@types';

const useUserAction = () => {
  const dispatch = useDispatch();
  const api = useSourc3Api();
  const thunks = userThunk(api);

  const connectBeamApi = () => dispatch(thunks.connectBeamApi());

  const connectExtension = () => dispatch(thunks.connectExtension());

  const checkTxStatus = (
    txId: string,
    callback: SetPropertiesType<TxResponse>
  ) => dispatch(thunks.getTxStatus(txId, callback));

  const removeTx = (txItem: TxItem) => dispatch(AC.removeTx(txItem));

  const setNotifiedTrue = (txItem: TxItem) => dispatch(AC.setTxNotifyTrue(txItem));

  const connectToDesktopApi = () => dispatch(thunks.connectElectronApi());

  const createAddressList = (
    resolve: PromiseArg<{ address: string }>,
    message:string = 'john smith'
  ) => {
    dispatch(thunks.createAddress(message, resolve));
  };

  const setWalletSendBeam = (
    amountValue: number,
    fromValue:string,
    commentValue:string,
    offline: boolean
  ) => dispatch(thunks.setWalletSendBeam(
    amountValue,
    fromValue,
    commentValue,
    offline
  ));

  return {
    connectToDesktopApi,
    createAddressList,
    connectBeamApi,
    connectExtension,
    checkTxStatus,
    removeTx,
    setNotifiedTrue,
    setWalletSendBeam
  };
};
export default useUserAction;
