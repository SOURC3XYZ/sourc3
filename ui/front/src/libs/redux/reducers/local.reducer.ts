import { ActionCreators } from '@libs/action-creators';
import { ACTIONS } from '@libs/constants';
import { LocalRepoBranch, LocalRepoId, LocalRepoName } from '@types';

interface ILocalRepo {
  currentId: LocalRepoId,
  localMap: Map<LocalRepoName, LocalRepoBranch[]> | null,
}

export const initialState:ILocalRepo = {
  currentId: null,
  localMap: null
};

const reducer = (state:ILocalRepo = initialState, action: ActionCreators):ILocalRepo => {
  const newState = {
    ...state,
    localMap: state.localMap ? new Map(Array.from(state.localMap)) : null
  };
  switch (action.type) {
    case ACTIONS.SET_LOCAL_MAP: {
      newState.localMap = action.payload as ILocalRepo['localMap'];
      return newState;
    }
    default:
      return state;
  }
};

export default reducer;
