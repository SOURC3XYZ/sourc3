import { ACTIONS } from '@libs/constants';
import {
  TxItem,
  RepoType,
  RepoMeta,
  RepoRef,
  RepoCommit,
  PropertiesType,
  DataNode,
  CommitHash
} from '@types';

export const AC = {
  setTx: (payload: string) => ({
    type: ACTIONS.SET_TX,
    payload
  }),

  removeTx: (payload: TxItem) => ({
    type: ACTIONS.REMOVE_TX,
    payload
  }),

  setTxNotifyTrue: (payload: TxItem) => ({
    type: ACTIONS.SET_TX_NOTIFY,
    payload
  }),

  setRepos: (payload: RepoType[]) => ({
    type: ACTIONS.GET_ALL_REPOS,
    payload
  }),

  setIsConnected: (payload: boolean) => ({
    type: ACTIONS.CONNECTION,
    payload
  } as const),

  setError: (
    payload: {
      code: number;
      status: string;
      message: string;
    } | null
  ) => ({
    type: ACTIONS.ERROR,
    payload
  } as const),

  setRepoMeta: (payload: RepoMeta[]) => ({
    type: ACTIONS.REPO_META,
    payload
  } as const),

  setCommitHash: (payload: CommitHash | null) => ({
    type: ACTIONS.SET_COMMIT_HASH,
    payload
  } as const),

  setRepoRefs: (payload: RepoRef[]) => ({
    type: ACTIONS.REPO_REFS,
    payload
  } as const),

  setCommitData: (payload: RepoCommit | null) => ({
    type: ACTIONS.COMMIT,
    payload
  } as const),

  setTreeData: (payload: DataNode[]) => ({
    type: ACTIONS.TREE_DATA,
    payload
  } as const),

  setFileText: (payload: string) => ({
    type: ACTIONS.SET_FILE_TEXT,
    payload
  } as const),

  setSearch: (inputText: string) => ({
    type: ACTIONS.SET_SEARCH,
    payload: inputText
  } as const)
};

export type ActionCreators = ReturnType<PropertiesType<typeof AC>>;
