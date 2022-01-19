import { ActionCreators } from '@libs/action-creators';
import { ACTIONS } from '@libs/constants';

interface IWallet {
  isWalletConnected: boolean;
  seedPhrase: string | null
}

const initialState:IWallet = {
  isWalletConnected: false,
  seedPhrase: null
};

const reducer = (
  state:IWallet = initialState, action: ActionCreators
):IWallet => {
  const newState = {
    ...state
  };
  switch (action.type) {
    case ACTIONS.SET_WALLET_CONNECTION: {
      newState.isWalletConnected = action
        .payload as IWallet['isWalletConnected'];
      return newState;
    }
    case ACTIONS.CONNECTION: {
      newState.seedPhrase = action.payload as IWallet['seedPhrase'];
      return newState;
    }
    default:
      return state;
  }
};

export default reducer;
