import { ActionCreators } from '@libs/action-creators';
import { ACTIONS } from '@libs/constants';
import { RepoType } from '@types';

interface IRepos {
  repos: RepoType[];
  searchText: string;
}

export const initialState: IRepos = {
  repos: [],
  searchText: ''
};

const reducer = (
  state: IRepos = initialState,
  action: ActionCreators
): IRepos => {
  const newState = JSON.parse(JSON.stringify(state)) as IRepos;
  switch (action.type) {
    case ACTIONS.GET_ALL_REPOS: {
      newState.repos = [...(action.payload as IRepos['repos'])];
      return newState;
    }
    case ACTIONS.SET_SEARCH: {
      newState.searchText = action.payload as IRepos['searchText'];
      return newState;
    }
    default:
      return state;
  }
};

export default reducer;
