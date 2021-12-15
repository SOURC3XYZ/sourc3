import { ActionCreators } from '@libs/action-creators';
import { ACTIONS } from '@libs/constants';
import {
  RepoRef, RepoMeta, RepoCommit, RepoType
} from '@types';
import { DataNode } from 'antd/lib/tree';

interface IRepo {
  repos: RepoType[]
  meta: RepoMeta[],
  refs: RepoRef[],
  commitData: RepoCommit | null,
  tree: DataNode[],
  fileText: string,
  searchText: string
}

export const initialState:IRepo = {
  repos: [],
  meta: [],
  refs: [],
  commitData: null,
  tree: [],
  fileText: '',
  searchText: ''
};

const reducer = (
  state:IRepo = initialState, action: ActionCreators
):IRepo => {
  const newState = JSON.parse(JSON.stringify(state)) as IRepo;
  switch (action.type) {
    case ACTIONS.REPO_META: {
      newState.meta = action.payload as RepoMeta[];
      break;
    }
    case ACTIONS.GET_ALL_REPOS: {
      newState.repos = [...action.payload as RepoType[]];
      break;
    }
    case ACTIONS.REPO_REFS: {
      newState.refs = action.payload as RepoRef[];
      break;
    }

    case ACTIONS.COMMIT: {
      newState.commitData = action.payload as RepoCommit;
      break;
    }

    case ACTIONS.TREE_DATA: {
      newState.tree = [...action.payload as DataNode[]];
      break;
    }

    case ACTIONS.SET_FILE_TEXT: {
      newState.fileText = action.payload as string;
      break;
    }

    case ACTIONS.SET_SEARCH: {
      newState.searchText = action.payload as string;
      break;
    }

    default:
  }
  return newState;
};

export default reducer;
