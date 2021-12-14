import { ActionCreators } from '@libs/action-creators';
import { ACTIONS } from '@libs/constants';
import { RepoType, TxItem } from '@types';

interface IApp {
  repos: RepoType[],
  isConnected: boolean;
  txs: Set<TxItem>
  error: {
    code: number,
    status: string,
    message: string
  } | null
}

const initialState:IApp = {
  repos: [],
  isConnected: false,
  txs: new Set(),
  error: null
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
      newState.isConnected = <boolean>action.payload;
      break;
    }
    case ACTIONS.GET_ALL_REPOS: {
      newState.repos = [...action.payload as RepoType[]];
      break;
    }
    case ACTIONS.SET_TX:
      newState.txs.add({
        id: <string>action.payload,
        notified: false
      });
      break;
    case ACTIONS.REMOVE_TX:
      newState.txs.delete(<TxItem>action.payload);
      break;

    case ACTIONS.SET_TX_NOTIFY:
      newState.txs.delete(<TxItem>action.payload);
      newState.txs.add({
        id: (<TxItem>action.payload).id,
        notified: true
      });
      break;
    default:
  }

  return newState;
};

export default reducer;
