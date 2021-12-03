import { RepoType, TxItem } from '@types';
import { ActionCreators } from '../action-creators/action-creators';
import { ACTIONS } from '../constants';

interface IApp {
  repos: RepoType[]
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

    default:
  }

  return newState;
};

export default reducer;
