import { ActionCreators } from '@libs/action-creators';
import { ACTIONS } from '@libs/constants';
import { ISourceProfiles } from '@types';

const initialState = {
  user_avatar_ipfs_hash: '',
  user_id: '',
  user_name: '',
  user_nickname: '',
  user_email: '',
  user_description: '',
  user_website: '',
  user_twitter: '',
  user_instagram: '',
  user_telegram: '',
  user_linkedin: '',
  user_discord: ''
};

const reducer = (
  state: ISourceProfiles = initialState,
  action: ActionCreators = {} as ActionCreators
):ISourceProfiles => {
  let newState = {
    ...state
  };
  switch (action.type) {
    case ACTIONS.SET_VIEW_USER: {
      newState = action.payload as typeof initialState;
      console.log(action.payload);
      return newState;
    }
    case ACTIONS.SET_MODIFY_USER: {
      newState = action.payload as typeof initialState;
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
