import { ActionCreators } from '@libs/action-creators';
import { ACTIONS, WALLET } from '@libs/constants';
import { Seed2ValidationType } from '@types';

interface IWallet {
  isWalletConnected: boolean;
  seedPhrase: string | null;
  seed2Validation: Seed2ValidationType
}

const initialState:IWallet = {
  isWalletConnected: false,
  seedPhrase: null,
  seed2Validation: {
    seed: new Array(WALLET.SEED_PHRASE_COUNT).fill(''),
    errors: new Array(WALLET.SEED_PHRASE_COUNT).fill(false)
  }
};

const reducer = (
  state:IWallet = initialState,
  action: ActionCreators = {} as ActionCreators
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
    case ACTIONS.SET_GENERATED_SEED: {
      newState.seedPhrase = action.payload as IWallet['seedPhrase'];
      console.log(newState.seedPhrase);
      return newState;
    }
    case ACTIONS.SET_SEED_TO_VALIDATION: {
      newState.seed2Validation = {
        ...state.seed2Validation,
        ...action.payload as IWallet['seed2Validation']
      };
      console.log(newState.seedPhrase);
      return newState;
    }
    default:
      return state;
  }
};

export default reducer;
