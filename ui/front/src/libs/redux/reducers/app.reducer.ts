import { ActionCreators } from '@libs/action-creators';
import { ACTIONS } from '@libs/constants';
import { BeamError, TxItem } from '@types';

interface IApp {
  isApiConnected: boolean;
  txs: Set<TxItem>
  error: BeamError | null,
  balance: number,
  addrList: string
  pkey: string
}

const initialState:IApp = {
  isApiConnected: false,
  txs: new Set(),
  error: null,
  balance: 0,
  addrList: '',
  pkey: ''
};

const reducer = (state:IApp = initialState, action: ActionCreators = {} as ActionCreators):IApp => {
  const newState = {
    ...state,
    txs: new Set(state.txs),
    error: state.error ? { ...state.error } : null
  };
  switch (action.type) {
    case ACTIONS.ERROR: {
      newState.error = action.payload as IApp['error'];
      return newState;
    }
    case ACTIONS.CONNECTION: {
      newState.isApiConnected = action.payload as IApp['isApiConnected'];
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

    default:
      return state;
  }
};

export default reducer;
