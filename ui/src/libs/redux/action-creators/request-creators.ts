import { PropertiesType } from '@types';

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

  createRepos: (resp_name:string) => ({
    callID: 'create_repo',
    method: 'invoke_contract',
    params: {
      args: {
        role: 'user',
        action: 'create_repo',
        repo_name: resp_name,
      },
      create_tx: false
    }
  } as const),

  deleteRepos: (repo_id:number) => ({
    callID: 'delete_repo',
    method: 'invoke_contract',
    params: {
      args: {
        role: 'user',
        action: 'delete_repo',
        repo_id,
      },
      create_tx: false
    }
  } as const)
};
export type RequestCreators = ReturnType<PropertiesType<typeof RC>>;
