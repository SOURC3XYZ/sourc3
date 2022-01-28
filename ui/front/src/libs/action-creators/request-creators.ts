import {
  CommitHash, PropertiesType, RepoId, TreeElementOid, TreeOid
} from '@types';

export const RC = {
  startTx: (data: number[]) => ({
    callID: 'start_tx',
    method: 'process_invoke_data',
    params: { data }
  } as const),

  getTxStatus: (txId: string) => ({
    callID: `tx_status_${txId}`,
    method: 'tx_status',
    params: {
      txId
    }
  } as const),

  zeroMethodCall: () => ({
    callID: 'zero_method_call',
    method: 'invoke_contract',
    params: { create_tx: false }
  } as const),

  getAllRepos: (type:string) => ({
    callID: 'all_repos',
    method: 'invoke_contract',
    params: {
      args: {
        role: 'user',
        action: `${type}_repos`
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
  } as const),

  createRepos: (resp_name:string) => ({
    callID: 'create_repo',
    method: 'invoke_contract',
    params: {
      args: {
        role: 'user',
        action: 'create_repo',
        repo_name: resp_name
      },
      create_tx: false
    }
  } as const),

  deleteRepos: (repo_id:RepoId) => ({
    callID: 'delete_repo',
    method: 'invoke_contract',
    params: {
      args: {
        role: 'user',
        action: 'delete_repo',
        repo_id
      },
      create_tx: false
    }
  } as const),

  getData: (repo_id:RepoId, obj_id: TreeElementOid) => ({
    callID: 'repo_get_data',
    method: 'invoke_contract',
    params: {
      args: {
        role: 'user',
        action: 'repo_get_data',
        repo_id,
        obj_id
      },
      create_tx: false
    }
  } as const),

  getCommitList: (repo_id:RepoId) => ({
    callID: 'repo_get_data',
    method: 'invoke_contract',
    params: {
      args: {
        role: 'user',
        action: 'list_commits',
        repo_id
      },
      create_tx: false
    }
  } as const),

  getWalletStatus: () => ({
    callID: 'get_wallet_status',
    method: 'wallet_status',
    params: {}
  } as const),

  getWalletAddressList: () => ({
    callID: 'get_wallet_addressList',
    method: 'addr_list',
    params:
    {
      own: true
    }
  } as const),

  setWalletSendBeam: (
    value: number,
    from: string,
    address:string,
    comment:string
  ) => ({
    callID: 'set_wallet_send_Beam',
    method: 'tx_send',
    params:
    {
      value,
      fee: 100000,
      from,
      address,
      comment,
      asset_id: 0,
      offline: false
    }
  } as const)

};
export type RequestCreators = ReturnType<PropertiesType<typeof RC>>;
