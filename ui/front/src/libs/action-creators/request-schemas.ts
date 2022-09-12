import { CONFIG } from '@libs/constants';
import {
  CommitHash, IProfile, PropertiesType, RepoId, TreeElementOid, TreeOid
} from '@types';

export const RC = {

  getTxList: () => ({
    callID: 'tx_list',
    method: 'tx_list',
    params: {}
  }),

  getIpfsData: (ipfsHash: string) => ({
    callID: 'ipfs_get',
    method: 'ipfs_get',
    params: {
      hash: ipfsHash,
      timeout: CONFIG.IPFS_TIMEOUT
    }
  } as const),

  getCommitFromData: (hash: string, hex:string) => ({
    callID: 'repo_get_commit_from_data',
    method: 'invoke_contract',
    params: {
      args: {
        role: 'user',
        action: 'repo_get_commit_from_data',
        data: hex,
        obj_id: hash
      },
      create_tx: false

    }
  } as const),

  getTreeFromData: (hash: string, data:string) => ({
    callID: 'repo_get_tree_from_data',
    method: 'invoke_contract',
    params: {
      args: {
        role: 'user',
        action: 'repo_get_tree_from_data',
        obj_id: hash,
        data
      },
      create_tx: false

    }
  } as const),

  startTx: (data: number[]) => ({
    callID: 'start_tx',
    method: 'process_invoke_data',
    params: { data }
  } as const),

  subUnsub: () => ({
    callID: 'subunsub',
    method: 'ev_subunsub',
    params: {
      ev_system_state: true
      // ev_txs_changed: true
    }
  } as const),

  getTxStatus: (txId: string) => ({
    callID: `tx_status_${txId}`,
    method: 'tx_status',
    params: {
      txId
    }
  } as const),

  viewContracts: () => ({
    callID: 'view_contracts',
    method: 'invoke_contract',
    params: {
      args: {
        role: 'manager',
        action: 'view_contracts'
      },
      create_tx: false
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
    address:string,
    comment:string,
    offline: boolean
  ) => ({
    callID: 'set_wallet_send_Beam',
    method: 'tx_send',
    params:
    {
      value,
      fee: 100000,
      address,
      comment,
      offline,
      asset_id: CONFIG.ASSET_ID
    }
  } as const),

  getPublicKey: (pid = 0) => ({
    callID: 'set_public_key',
    method: 'invoke_contract',
    params: {
      args: {
        role: 'user',
        action: 'get_key',
        pid
      },
      create_tx: false
    }
  } as const),

  createAddress: (comment: string) => ({
    callID: 'create_adress',
    method: 'create_address',
    params:
    {
      comment,
      type: 'regular',
      expiration: 'auto',
      new_style_regular: true
    }
  } as const),

  getOrganizations: () => ({
    callID: 'list_organizations',
    method: 'invoke_contract',
    params: {
      create_tx: false,
      args: {
        role: 'user',
        action: 'list_organizations'
      }
    }
  }),

  getProjects: () => ({
    callID: 'list_projects',
    method: 'invoke_contract',
    params: {
      create_tx: false,
      args: {
        role: 'user',
        action: 'list_projects'
      }
    }
  }),
  createOrganization: (name:string, pid = 0) => ({
    callID: 'create_organization',
    method: 'invoke_contract',
    params: {
      create_tx: false,
      args: {
        role: 'user',
        action: 'create_organization',
        name,
        pid
      }
    }
  }),
  createProject: (name:string, organization_id:number, pid = 0) => ({
    callID: 'create_project',
    method: 'invoke_contract',
    params: {
      create_tx: false,
      args: {
        role: 'user',
        action: 'create_project',
        name,
        organization_id,
        pid
      }
    }
  }),

  createRepo: (repo_name:string, project_id: number, pid = 0) => ({
    callID: 'create_repo',
    method: 'invoke_contract',
    params: {
      create_tx: false,
      args: {
        role: 'user',
        action: 'create_repo',
        repo_name,
        project_id,
        pid
      }
    }
  } as const),
  getUser: (id:string) => ({
    callID: 'view_user',
    method: 'invoke_contract',
    params: {
      create_tx: false,
      args: {
        role: 'user',
        action: 'view_user',
        id
      }
    }
  } as const),
  setModifyUser: ({
    id,
    names,
    nickname,
    description,
    email,
    twitter,
    instagram,
    telegram,
    discord,
    linkedin,
    website,
    avatar_addr
  }: IProfile) => ({
    callID: 'modify_user',
    method: 'invoke_contract',
    params: {
      create_tx: false,
      args: {
        role: 'user',
        action: 'modify_user',
        id,
        avatar_addr,
        name: names,
        nickname,
        description,
        email,
        twitter,
        instagram,
        telegram,
        discord,
        linkedin,
        website
      }
    }
  } as const),
  getProjectsByOrg: (organization_id: number) => ({
    callID: 'list_organization_projects',
    method: 'invoke_contract',
    params: {
      create_tx: false,
      args: {
        role: 'user',
        action: 'list_organization_projects',
        organization_id
      }
    }
  } as const),
  getOrgMembers: (organization_id: number) => ({
    callID: 'list_organization_members',
    method: 'invoke_contract',
    params: {
      create_tx: false,
      args: {
        role: 'user',
        action: 'list_organization_members',
        organization_id
      }
    }
  } as const),
  getProjectMembers: (project_id: number) => ({
    callID: 'list_project_members',
    method: 'invoke_contract',
    params: {
      create_tx: false,
      args: {
        role: 'user',
        action: 'list_project_members',
        project_id
      }
    }
  } as const),
  setModifyOrganization: ({
    organization_id,
    name,
    logo_addr = '',
    short_title = '',
    about = '',
    website = '',
    twitter = '',
    linkedin = '',
    instagram = '',
    telegram = '',
    discord = '',
    pid = 0
  }: any) => ({
    callID: 'modify_organization',
    method: 'invoke_contract',
    params: {
      create_tx: false,
      args: {
        role: 'user',
        action: 'modify_organization',
        organization_id,
        name,
        logo_addr,
        short_title,
        about,
        website,
        twitter,
        linkedin,
        instagram,
        telegram,
        discord,
        pid
      }
    }
  } as const)
};
export type RequestSchema = ReturnType<PropertiesType<typeof RC>>;
