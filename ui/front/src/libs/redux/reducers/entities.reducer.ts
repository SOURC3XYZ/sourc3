import { ActionCreators } from '@libs/action-creators';
import { ACTIONS } from '@libs/constants';
import { Organization, Project, RepoType } from '@types';

interface IRepos {
  repos: RepoType[];
  organizations: Organization[];
  projects: Project[];
  searchText: string;
}

export const initialState: IRepos = {
  repos: [],
  organizations: [],
  projects: [],
  searchText: ''
};

const reducer = (
  state: IRepos = initialState,
  action: ActionCreators = {} as ActionCreators
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
    case ACTIONS.SET_ORGANIZATIONS: {
      newState.organizations = action.payload as IRepos['organizations'];
      return newState;
    }
    case ACTIONS.SET_PROJECTS: {
      newState.projects = action.payload as IRepos['projects'];
      return newState;
    }
    default:
      return state;
  }
};

export default reducer;
