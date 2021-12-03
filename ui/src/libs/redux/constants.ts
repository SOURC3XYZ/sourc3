export enum ACTIONS {
  CONNECTION = 'CONNECTION',
  GET_ALL_REPOS = 'GET_ALL_REPOS',
  SET_TX_NOTIFY = 'SET_TX_NOTIFY',
  REMOVE_TX = 'REMOVE_TX',
  SET_TX = 'SET_TX',
  ERROR = 'ERROR'
}

export enum STATUS {
  IN_PROGRESS = 'in progress',
  FAILED = 'failed',
  COMPLETED = 'completed',
  PENDING = 'pending'
}
