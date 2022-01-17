import { ActionCreators } from '@libs/action-creators';
import { ACTIONS } from '@libs/constants';
import {
  DataNode, BranchCommit, BranchName, RepoId
} from '@types';

interface IRepo {
  id: RepoId | null,
  repoMap: Map<BranchName, BranchCommit[]> | null,
  tree: DataNode[] | null,
  fileText: string | null,
  prevReposHref: string | null
}

export const initialState:IRepo = {
  id: null,
  repoMap: null,
  tree: null,
  fileText: null,
  prevReposHref: null
};

const reducer = (
  state:IRepo = initialState, action: ActionCreators
):IRepo => {
  const newState = {
    ...state,
    repoMap: state.repoMap
      ? new Map(Array.from(state.repoMap))
      : null
  } as IRepo;
  switch (action.type) {
    case ACTIONS.SET_REPO_ID: {
      newState.id = action.payload as IRepo['id'];
      return newState;
    }
    case ACTIONS.TREE_DATA: {
      newState.tree = action.payload as IRepo['tree'];
      return newState;
    }
    case ACTIONS.SET_FILE_TEXT: {
      newState.fileText = action.payload as IRepo['fileText'];
      return newState;
    }
    case ACTIONS.SET_REPO_MAP: {
      newState.repoMap = action.payload as IRepo['repoMap'];
      return newState;
    }
    case ACTIONS.SET_PREV_REPO_HREF: {
      newState.prevReposHref = action.payload as IRepo['prevReposHref'];
      return newState;
    }
    default:
      return state;
  }
};

export default reducer;
