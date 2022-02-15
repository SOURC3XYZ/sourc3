import { ACTIONS } from '@libs/constants';
import {
  TxItem,
  RepoType,
  RepoMeta,
  Branch,
  BranchCommit,
  PropertiesType,
  DataNode,
  CommitHash,
  Commit,
  BranchName,
  RepoId,
  Seed2ValidationType
} from '@types';

export const AC = {
  setWalletConnection: (payload: boolean) => ({
    type: ACTIONS.SET_WALLET_CONNECTION,
    payload
  }),

  setGeneratedSeed: (payload: string | null) => ({
    type: ACTIONS.SET_GENERATED_SEED,
    payload
  }),

  setSeed2Validation: (payload: Partial<Seed2ValidationType>) => ({
    type: ACTIONS.SET_SEED_TO_VALIDATION,
    payload
  }),

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
      code?: number;
      status?: string;
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

  setRepoRefs: (payload: Branch[]) => ({
    type: ACTIONS.REPO_REFS,
    payload
  } as const),

  setCommitData: (payload: BranchCommit | null) => ({
    type: ACTIONS.COMMIT,
    payload
  } as const),

  setTreeData: (payload: DataNode[] | null) => ({
    type: ACTIONS.TREE_DATA,
    payload
  } as const),

  setFileText: (payload: string | null) => ({
    type: ACTIONS.SET_FILE_TEXT,
    payload
  } as const),

  setSearch: (payload: string) => ({
    type: ACTIONS.SET_SEARCH,
    payload
  } as const),

  setCommitList: (payload: Commit[]) => ({
    type: ACTIONS.SET_COMMITS_LIST,
    payload
  } as const),

  setCommitRefList: (payload: BranchCommit[]) => ({
    type: ACTIONS.SET_BRANCH_REF_LIST,
    payload
  } as const),

  setRepoMap: (payload: Map<BranchName, BranchCommit[]> | null) => ({
    type: ACTIONS.SET_REPO_MAP,
    payload
  } as const),

  setRepoId: (payload: RepoId) => ({
    type: ACTIONS.SET_REPO_ID,
    payload
  } as const),

  setPreviousReposPage: (payload: string) => ({
    type: ACTIONS.SET_PREV_REPO_HREF,
    payload
  } as const),

  setWalletStatus: (payload: any) => ({
    type: ACTIONS.SET_WALLET_STATUS,
    payload
  } as const),

  setWalletAddressList: (payload: any) => ({
    type: ACTIONS.SET_WALLET_ADDRESS_LIST,
    payload
  } as const),

  setPublicKey: (payload: any) => ({
    type: ACTIONS.SET_PUBLIC_KEY,
    payload
  } as const)

};

export type ActionCreators = ReturnType<PropertiesType<typeof AC>>;
