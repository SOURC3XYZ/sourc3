import { ActionCreators } from '@libs/action-creators';
import { ACTIONS } from '@libs/constants';

export interface IProfiles {
  id: string,
  login: string,
  created_at: string,
  updated_at: string,
  token: string,
  github_profile: IProfilesGit
}

export interface IProfilesGit {
  id: string,
  login: string,
  email: string,
  name: string,
  avatar_url: string,
  blo: string,
  location: string,
  twitter_username: string,
}

const defaultValue: IProfiles = {
  id: '',
  login: '',
  created_at: '',
  updated_at: '',
  token: '',
  github_profile:[]
};

const initialState = {
  data: defaultValue
};

const reducer = (
  state = initialState,
  action: ActionCreators = {} as ActionCreators
):{ data: IProfiles } => {
  const newState = {
    ...state
  };
  switch (action.type) {
    case ACTIONS.GET_GIT_USER: {
      newState.data = action.payload.data as IProfiles;
      return newState;
    }
    default:
      return state;
  }
};
export default reducer;
