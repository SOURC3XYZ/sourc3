import { ActionCreators } from '@libs/action-creators';
import { ACTIONS } from '@libs/constants';
import {
  RepoRef, RepoMeta, RepoCommit
} from '@types';
import { DataNode } from 'antd/lib/tree';

interface IRepo {
  meta: RepoMeta[],
  refs: RepoRef[],
  commitData: RepoCommit | null,
  tree: DataNode[]
}

const initialState:IRepo = {
  meta: [],
  refs: [],
  commitData: null,
  tree: []
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

    default:
  }
  return newState;
};

export default reducer;
