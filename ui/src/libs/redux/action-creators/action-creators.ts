import { ACTIONS } from '@libs/constants';
import { PropertiesType, TxItem } from '@types';
import { RepoType } from 'types/contract';

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

  createRepos: (payload: RepoType[]) => ({
    type: ACTIONS.CREATE_REPOS,
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
  } as const)
};

export type ActionCreators = ReturnType<PropertiesType<typeof AC>>;
