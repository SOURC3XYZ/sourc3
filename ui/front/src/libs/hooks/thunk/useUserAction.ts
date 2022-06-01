import { useSourc3Web } from '@components/context';
import { AC } from '@libs/action-creators';
import { userThunk } from '@libs/action-creators/async';
import { useDispatch } from '@libs/redux';
import { SetPropertiesType, TxItem, TxResponse } from '@types';

const useUserAction = () => {
  const dispatch = useDispatch();
  const api = useSourc3Web();
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

  return {
    connectToDesktopApi,
    connectBeamApi,
    connectExtension,
    checkTxStatus,
    removeTx,
    setNotifiedTrue
  };
};
export default useUserAction;
