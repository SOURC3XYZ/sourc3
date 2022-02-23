export type PropertiesType<T> = T extends { [key: string]: infer U }
  ? U
  : never;

export interface IAssetMeta {
  N: string;
  OPT_COLOR: string;
}

export interface BeamApiResult {
  output?: string;
  txid: string;
  txId: string;
  raw_data: number[];
  comment: string;
  status_string: string;
  failure_reason: string;
  metadata_pairs: IAssetMeta;
  available: number;
  address:string
}

export interface BeamApiRes {
  id: string;
  jsonrpc: string;
  result: BeamApiResult;
  error?: {
    code:number;
    message: string;
  }
}

export type CallApiProps<T> = {
  callID: string;
  method: string;
  params: T;
};

export type TxResponse = {
  message: string;
  status_string: string;
};

export type TxItem = {
  id: string,
  notified: boolean
};

export type ErrorObj = {
  code?: number,
  status?: string,
  message: string
};

export type SetPropertiesType<T> = React.Dispatch<
React.SetStateAction<T>
>;

export interface BeamError extends Error {
  code?: number,
  status?: string
}
