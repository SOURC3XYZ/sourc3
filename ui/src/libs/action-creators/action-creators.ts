import { ACTIONS } from '@libs/constants';
import {
  PropertiesType, RepoCommit, RepoMeta, RepoRef, RepoType, TxItem
} from '@types';
import { DataNode } from 'antd/lib/tree';

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
  setMyRepos: (payload: RepoType[]) => ({
    type: ACTIONS.GET_MY_REPOS,
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
  } as const)
};

export type ActionCreators = ReturnType<PropertiesType<typeof AC>>;
