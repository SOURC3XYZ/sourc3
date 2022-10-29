import { ActionCreators, RepoReqType } from '@libs/action-creators';
import { ACTIONS } from '@libs/constants';
import {
  DataNode, BranchCommit, BranchName, MetaHash, RepoMeta, Branch
} from '@types';

interface IRepo {
  params: RepoReqType | null,
  branches: Branch[],
  commitsMap: Map<string, BranchCommit> | null,
  repoMetas: Map<MetaHash, RepoMeta>,
  repoMap: Map<BranchName, BranchCommit[]> | null,
  tree: DataNode[] | null,
  filesMap: Map<MetaHash, string>,
  fileText: string | null,
  prevReposHref: string | null
}

export const initialState:IRepo = {
  params: null,
  branches: [],
  repoMetas: new Map(),
  filesMap: new Map(),
  commitsMap: null,
  repoMap: null,
  tree: null,
  fileText: null,
  prevReposHref: null
};

const reducer = (
  state:IRepo = initialState,
  action: ActionCreators = {} as ActionCreators
):IRepo => {
  const newState = {
    ...state,
    repoMap: state.repoMap
      ? new Map(Array.from(state.repoMap))
      : null,
    filesMap: new Map(Array.from(state.filesMap))
  } as IRepo;
  switch (action.type) {
    case ACTIONS.SET_BRANCH_REF_LIST:
      newState.branches = action.payload as IRepo['branches'];
      return newState;

    case ACTIONS.SET_REPO_ID: {
      newState.params = { ...action.payload } as IRepo['params'];
      newState.filesMap = new Map();
      return newState;
    }
    case ACTIONS.SET_REPO_FILE: {
      newState.filesMap.set(...action.payload as [MetaHash, string]);
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
    case ACTIONS.SET_COMMITS_MAP: {
      newState.commitsMap = action.payload as IRepo['commitsMap'];
      return newState;
    }
    case ACTIONS.SET_PREV_REPO_HREF: {
      newState.prevReposHref = action.payload as IRepo['prevReposHref'];
      return newState;
    }
    case ACTIONS.REPO_META: {
      newState.repoMetas = action.payload as IRepo['repoMetas'];
      return newState;
    }
    default:
      return state;
  }
};

export default reducer;
