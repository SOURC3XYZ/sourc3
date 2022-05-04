import { ActionCreators } from '@libs/action-creators';
import { ACTIONS } from '@libs/constants';
import { BeamError, TxItem, TxInfo } from '@types';

interface IUser {
  isApiConnected: boolean;
  txs: Set<TxItem>
  error: BeamError | null,
  balance: number,
  addrList: string
  pkey: string,
  txList: TxInfo[]
}

const initialState:IUser = {
  isApiConnected: false,
  txs: new Set(),
  error: null,
  balance: 0,
  addrList: '',
  pkey: '',
  txList: []
};

const reducer = (
  state:IUser = initialState,
  action: ActionCreators = {} as ActionCreators
):IUser => {
  const newState = {
    ...state,
    txs: new Set(state.txs),
    error: state.error ? { ...state.error } : null
  };
  switch (action.type) {
    case ACTIONS.ERROR: {
      newState.error = action.payload as IUser['error'];
      return newState;
    }
    case ACTIONS.CONNECTION: {
      newState.isApiConnected = action.payload as IUser['isApiConnected'];
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

    case ACTIONS.SET_PUBLIC_KEY:
      newState.pkey = action.payload as string;
      return newState;

    case ACTIONS.SET_TX_LIST:
      newState.txList = action.payload as IUser['txList'];
      return newState;

    default:
      return state;
  }
};

export default reducer;
