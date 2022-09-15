import { ActionCreators } from '@libs/action-creators';
import { ACTIONS } from '@libs/constants';
import { IGitOrgs, IProfiles, IProfilesGit } from '@types';

export const defaultValueOrg: IGitOrgs = {
  id: 0,
  login: '',
  node_id: '',
  name: '',
  avatar_url: '',
  description: '',
  users: []
};
export const defaultValueProf: IProfilesGit = {
  id: 0,
  login: '',
  node_id: '',
  name: '',
  avatar_url: '',
  blog_url: '',
  company: '',
  location: '',
  email: '',
  hireable: '',
  bio: '',
  twitter_username: '',
  public_repos: 0,
  followers: 0,
  following: 0,
  mutual_followers: 0,
  created_at: '',
  updated_at: '',
  user: 0
};

export const defaultValue: IProfiles = {
  id: '',
  login: '',
  created_at: '',
  updated_at: '',
  token: '',
  github_profile: defaultValueProf,
  github_orgs: [defaultValueOrg],
  github_owned_repos: []
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
