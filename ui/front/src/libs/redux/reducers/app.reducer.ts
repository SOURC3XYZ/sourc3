import { ActionCreators } from '@libs/action-creators';
import { ACTIONS } from '@libs/constants';
import { TxItem } from '@types';

interface IApp {
  isConnected: boolean;
  txs: Set<TxItem>
  error: {
    code: number,
    status: string,
    message: string
  } | null,
  balance: number,
  addrList: string
}

const initialState:IApp = {
  isConnected: false,
  txs: new Set(),
  error: null,
  balance: 0,
  addrList: ''
};

const reducer = (
  state:IApp = initialState, action: ActionCreators
):IApp => {
  const newState = {
    ...state,
    txs: new Set(state.txs),
    error: state.error ? { ...state.error } : null
  };
  switch (action.type) {
    case ACTIONS.CONNECTION: {
      newState.isConnected = action.payload as IApp['isConnected'];
      return newState;
    }
    case ACTIONS.SET_TX:
      newState.txs.add({
        id: action.payload,
        notified: false
      } as TxItem);
      return newState;

    case ACTIONS.REMOVE_TX:
      newState.txs.delete(action.payload as TxItem);
      return newState;

    case ACTIONS.SET_TX_NOTIFY:
      newState.txs.delete(action.payload as TxItem);
      newState.txs.add({
        id: (<TxItem>action.payload).id,
        notified: true
      });
      return newState;

    case ACTIONS.SET_WALLET_STATUS:
      newState.balance = action.payload as number;
      return newState;

    case ACTIONS.SET_WALLET_ADDRESS_LIST:
      newState.addrList = action.payload as string;
      return newState;

    default:
      return state;
  }
};

export default reducer;
