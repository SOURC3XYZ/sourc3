import {
  CommitHash, PropertiesType, RepoId, TreeOid
} from '@types';

export const RC = {
  startTx: (data: number[]) => ({
    callID: 'start_tx',
    method: 'process_invoke_data',
    params: { data }
  }),

  getTxStatus: (txId: string) => ({
    callID: `tx_status_${txId}`,
    method: 'tx_status',
    params: {
      txId
    }
  }),
  zeroMethodCall: () => ({
    callID: 'zero_method_call',
    method: 'invoke_contract',
    params: { create_tx: false }
  } as const),

  getAllRepos: () => ({
    callID: 'all_repos',
    method: 'invoke_contract',
    params: {
      args: {
        role: 'user',
        action: 'all_repos'
      },
      create_tx: false
    }
  } as const),

  repoGetMeta: (repo_id:number) => ({
    callID: 'repo_get_meta',
    method: 'invoke_contract',
    params: {
      args: {
        role: 'user',
        action: 'repo_get_meta',
        repo_id
      },
      create_tx: false
    }
  } as const),

  repoGetRefs: (repo_id:number) => ({
    callID: 'repo_get_refs',
    method: 'invoke_contract',
    params: {
      args: {
        role: 'user',
        action: 'list_refs',
        repo_id
      },
      create_tx: false
    }
  } as const),

  repoGetCommit: (repo_id: RepoId, obj_id: CommitHash) => ({
    callID: 'repo_get_commit',
    method: 'invoke_contract',
    params: {
      args: {
        role: 'user',
        action: 'repo_get_commit',
        obj_id,
        repo_id
      },
      create_tx: false
    }
  } as const),

  repoGetTree: (repo_id: RepoId, obj_id: TreeOid) => ({
    callID: 'repo_get_tree',
    method: 'invoke_contract',
    params: {
      args: {
        role: 'user',
        action: 'repo_get_tree',
        obj_id,
        repo_id
      },
      create_tx: false
    }
  } as const)

};
export type RequestCreators = ReturnType<PropertiesType<typeof RC>>;
