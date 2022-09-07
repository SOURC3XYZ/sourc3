import { ActionCreators } from '@libs/action-creators';
import { ACTIONS } from '@libs/constants';

export interface IProfiles {
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
  email: '',
  name: '',
  avatar_url: '',
  blo: '',
  location: '',
  twitter_username: ''
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
