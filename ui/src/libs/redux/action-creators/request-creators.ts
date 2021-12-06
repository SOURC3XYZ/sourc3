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
  } as const)
};
export type RequestCreators = ReturnType<PropertiesType<typeof RC>>;
