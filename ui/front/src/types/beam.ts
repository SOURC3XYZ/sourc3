export type PropertiesType<T> = T extends { [key: string]: infer U }
  ? U
  : never;

export interface IAssetMeta {
  N: string;
  OPT_COLOR: string;
}

export type IPCResult<T> = {
  ipc: T
};

export type EventResult = {
  current_height: number,
  tip_height: number,
  is_in_sync:boolean, // api events props
};

export type TxResult = {
  data: number[] | string,
  output?: string;
  txid: string;
  txId: string;
  comment: string;
  status_string: string;
  failure_reason: string;
  available: number;
  address:string
};

export type Rate = {
  from: number,
  rate: number,
  rate_str: string,
  to: string
};

export type TxInfo = {
  asset_id: number,
  txId : string,
  comment: string,
  fee: number,
  kernel: string,
  receiver: string,
  sender: string,
  status: number,
  status_string: string,
  failure_reason: string,
  value: number,
  create_time : number,
  income : boolean,
  token: string,
  rates: Rate[]
};

export type IpfsResult = {
  data: number[] | string,
};

export type ContractResult = {
  output: string;
};

export type ResultObject<T = any> = IPCResult<T>
| ContractResult
| IpfsResult
| EventResult
| TxResult
| TxInfo[]
| string
| any;

export interface BeamApiRes<T extends ResultObject> {
  id: string;
  jsonrpc: string;
  result: T;
  error?: {
    code:number;
    message: string;
  }
}

export type CallApiProps<T> = {
  callID: string;
  method: string;
  params: T;
  isContractInit?: boolean
};

export type TxResponse = {
  comment: string;
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

export type SetPropertiesType<T> = React.Dispatch<React.SetStateAction<T>>;

export interface BeamError extends Error {
  code?: number,
  status?: string
}
