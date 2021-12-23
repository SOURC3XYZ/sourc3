import { ActionCreators } from '@libs/action-creators';
import { ACTIONS } from '@libs/constants';
import {
  RepoRef, RepoMeta, RepoCommit, DataNode
} from '@types';

interface IRepo {
  meta: RepoMeta[],
  refs: RepoRef[],
  tree: DataNode[],
  commitData: RepoCommit | null,
  commitHash: string | null,
  fileText: string
}

export const initialState:IRepo = {
  meta: [],
  refs: [],
  tree: [],
  commitData: null,
  commitHash: null,
  fileText: ''
};

const reducer = (
  state:IRepo = initialState, action: ActionCreators
):IRepo => {
  const newState = { ...state } as IRepo;
  switch (action.type) {
    case ACTIONS.REPO_META: {
      newState.meta = action.payload as IRepo['meta'];
      return newState;
    }
    case ACTIONS.REPO_REFS: {
      newState.refs = action.payload as IRepo['refs'];
      return newState;
    }
    case ACTIONS.COMMIT: {
      newState.commitData = action.payload as IRepo['commitData'];
      return newState;
    }
    case ACTIONS.TREE_DATA: {
      newState.tree = [...action.payload as IRepo['tree']];
      return newState;
    }
    case ACTIONS.SET_FILE_TEXT: {
      newState.fileText = action.payload as IRepo['fileText'];
      return newState;
    }
    case ACTIONS.SET_COMMIT_HASH: {
      newState.commitHash = action.payload as IRepo['commitHash'];
      return newState;
    }
    default:
      return state;
  }
};

export default reducer;
