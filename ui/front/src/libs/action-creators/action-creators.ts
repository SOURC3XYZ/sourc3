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
  Seed2ValidationType,
  LocalRepoBranch,
  LocalRepoName,
  MetaHash,
  TxInfo,
  Organization,
  Project,
  User
} from '@types';

export const AC = {
  setLocalRepoMap: (
    payload: Map<LocalRepoName, LocalRepoBranch[]> | null
  ) => ({
    type: ACTIONS.SET_LOCAL_MAP,
    payload
  } as const),

  setCommits: (
    payload: Map<string, BranchCommit> | null
  ) => ({
    type: ACTIONS.SET_COMMITS_MAP,
    payload
  }),

  setUsers: (payload: User[]) => ({
    type: ACTIONS.SET_USERS,
    payload
  }),

  setWalletConnection: (payload: boolean) => ({
    type: ACTIONS.SET_WALLET_CONNECTION,
    payload
  } as const),

  setGeneratedSeed: (payload: string | null) => ({
    type: ACTIONS.SET_GENERATED_SEED,
    payload
  } as const),

  setSeed2Validation: (payload: Partial<Seed2ValidationType>) => ({
    type: ACTIONS.SET_SEED_TO_VALIDATION,
    payload
  } as const),

  setTx: (payload: string) => ({
    type: ACTIONS.SET_TX,
    payload
  } as const),

  removeTx: (payload: TxItem) => ({
    type: ACTIONS.REMOVE_TX,
    payload
  } as const),

  setTxNotifyTrue: (payload: TxItem) => ({
    type: ACTIONS.SET_TX_NOTIFY,
    payload
  } as const),

  setRepos: (payload: RepoType[]) => ({
    type: ACTIONS.GET_ALL_REPOS,
    payload
  } as const),

  addFileToMap: (payload: [MetaHash, string]) => ({
    type: ACTIONS.SET_REPO_FILE,
    payload
  } as const),

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

  setRepoMeta: (payload: Map<MetaHash, RepoMeta>) => ({
    type: ACTIONS.REPO_META,
    payload
  } as const),

  setCommitHash: (payload: CommitHash | null) => ({
    type: ACTIONS.SET_COMMIT_HASH,
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

  setRepoMap: (payload: Map<BranchName, BranchCommit[]> | null) => ({
    type: ACTIONS.SET_REPO_MAP,
    payload
  } as const),

  setRepoId: (payload: RepoId | null) => ({
    type: ACTIONS.SET_REPO_ID,
    payload
  } as const),

  setPreviousReposPage: (payload: string | null) => ({
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
  } as const),

  setTxList: (payload: TxInfo[]) => ({
    type: ACTIONS.SET_TX_LIST,
    payload
  } as const),

  setOrganizationsList: (payload: Organization[]) => ({
    type: ACTIONS.SET_ORGANIZATIONS,
    payload
  } as const),

  setProjectsList: (payload: Project[]) => ({
    type: ACTIONS.SET_PROJECTS,
    payload
  } as const),

  setBranchRefList: (payload: Branch[]) => ({
    type: ACTIONS.SET_BRANCH_REF_LIST,
    payload
  } as const),

  getAuthGitUser: (payload: any) => ({
    type: ACTIONS.GET_GIT_USER,
    payload
  } as const)
};

export type ActionCreators = ReturnType<PropertiesType<typeof AC>>;
