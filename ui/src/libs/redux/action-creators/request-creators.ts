import { PropertiesType } from '@types';

export const RC = {
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
