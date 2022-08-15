// 'http://localhost:5001/beam'
export enum CONFIG {
  HOST = 'http://localhost:5001',
  NETWORK = 'mainnet',
  CID = '17885447b4c5f78b65ac01bfa5d63d6bc2dd7b239c6cd7ef57a918adba2071d3',
  // '17885447b4c5f78b65ac01bfa5d63d6bc2dd7b239c6cd7ef57a918adba2071d3' - DEV
  // ec90c6258019107543e0726c415f8b92c78805afcdb1336a61345b97486d2832 - DEMO
  // dappnet demo e95c0ab0b2ccbd79f542ea307bf6aa6f1898dcc607a4faedf187e7309e8d38b9
  // '7aaec975d0348348d82e72bd66d508ac93cb6f9e683bd136d2a879f41c32e8d8'
  // 'fda210a4af51fdd2ce1d2a1c0307734ce6fef30b3eec4c04c4d7494041f2dd10',
  // IPFS_HOST = 'http://3.209.99.179:8070'
  DOWNLOAD_LINK = 'https://apps.beam.mw/ipfs',
  HEADLESS_NODE = 'eu-node01.mainnet.beam.mw:8200',
  IPFS_HOST = 'https://cache.sourc3.xyz',
  ASSET_ID = 0,
  IPFS_TIMEOUT = 20000,
  BIN_REPO = '/repo/2&sourc3-binaries/branch/tree/master'
}
// fda210a4af51fdd2ce1d2a1c0307734ce6fef30b3eec4c04c4d7494041f2dd10
// 126c94dad2a409d1af5beb1667972ebcbd165d940159049f4a0ad6b5f4b8e976

export enum WALLET {
  EXT_DOWNLOAD = 'https://github.com/SOURC3XYZ/Sourc3-Web-Client/actions',
  EXT_ID = 'kjdmogmgfgjedkpeldbomhgpnhehnnbe',
  EXT_IMG = 'assets/chrome-extention-icon-16x16.png',
  SEED_PHRASE_COUNT = 12,
  SEED_CONFIRM_PHRASE_COUNT = 6,
  IPFS_TIMEOUT = 2000
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
