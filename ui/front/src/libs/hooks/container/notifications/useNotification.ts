import { useUserAction } from '@libs/hooks/thunk';
import { useSelector } from '@libs/redux';

const useNotification = () => {
  const txs = useSelector((state) => Array.from(state.app.txs));
  const { removeTx, checkTxStatus, setNotifiedTrue } = useUserAction();
  return {
    txs, removeTx, checkTxStatus, setNotifiedTrue
  };
};

export default useNotification;
