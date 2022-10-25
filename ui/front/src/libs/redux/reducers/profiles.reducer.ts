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
  github_login: '',
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
    case ACTIONS.GIT_USER_LOGOUT: {
      newState.data = defaultValue;
      localStorage.clear();
      return newState;
    }
    default:
      return state;
  }
};
export default reducer;

// export interface IProfiles {
//   user_avatar_ipfs_hash: string,
//   user_id: string,
//   user_name: string,
//   user_nickname: string,
//   user_email: string,
//   user_description: string,
//   user_website: string
//   user_twitter: string,
//   user_instagram: string,
//   user_telegram: string,
//   user_linkedin: string,
//   user_discord: string
// }
// const initialState: IProfiles = {
//   user_avatar_ipfs_hash: '',
//   user_id: '',
//   user_name: '',
//   user_nickname: '',
//   user_email: '',
//   user_description: '',
//   user_website: '',
//   user_twitter: '',
//   user_instagram: '',
//   user_telegram: '',
//   user_linkedin: '',
//   user_discord: ''
// };

// const reducer = (
//   state: IProfiles = initialState,
//   action: ActionCreators = {} as ActionCreators
// ):IProfiles => {
//   let newState = {
//     ...state
//   };
//   switch (action.type) {
//     case ACTIONS.SET_VIEW_USER: {
//       newState = action.payload as typeof initialState;
//       console.log(action.payload);
//       return newState;
//     }
//     case ACTIONS.SET_MODIFY_USER: {
//       newState = action.payload as typeof initialState;
