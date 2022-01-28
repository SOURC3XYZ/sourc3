// 'http://localhost:5001/beam'
export enum CONTRACT {
  HOST = 'http://localhost:5001',
  CID = 'fda210a4af51fdd2ce1d2a1c0307734ce6fef30b3eec4c04c4d7494041f2dd10'
}
// fda210a4af51fdd2ce1d2a1c0307734ce6fef30b3eec4c04c4d7494041f2dd10
// 126c94dad2a409d1af5beb1667972ebcbd165d940159049f4a0ad6b5f4b8e976

export enum WALLET {
  SEED_PHRASE_COUNT = 12
}

export enum STATUS {
  IN_PROGRESS = 'in progress',
  FAILED = 'failed',
  COMPLETED = 'completed',
  PENDING = 'pending',
  WAITING_FOR_RECEIVER = 'waiting for receiver',
  WAITING_FOR_SENDING = 'waiting for sender',
  SELF_SENDING = 'self sending',
  CANCELED = 'cancelled',
  RECEIVED = 'received',
  ASSET_ISSUED = 'asset issued',
  RECEIVING = 'receiving',
  SENT = 'sent',
  SENDING = 'sending'
}

export enum BeamAmmount {
  MIN_AMOUNT = 0,
  MAX_AMOUNT = 10,
  GROTHS_IN_BEAM = 100000000
}
