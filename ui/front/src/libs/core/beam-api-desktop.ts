import {
  IpcMethod,
  QObject, ResultObject
} from '@types';

type ArgsObjectType = { [key:string]: string | number };

type CallApiProps<T> = {
  callID: string;
  method: string;
  params: T;
  isContractInit?: boolean;
};

type MessageType = {
  type: string;
  response: ResultObject
};

type BeamApiReqHandlers = {
  resolve: (value: ResultObject) => void,
  reject: (reason?: any) => void
};

type BeamObject = {
  api: QObject,
  headless?: boolean,
  module?: any,
  factory?: any,
  client?: any,
  appid?: any,
};

type Modified<T> = T & {
  contract: Array<number>, args: string | ArgsObjectType, hash?:string };

export class BeamApiDesktop<T> {
  public readonly cid: string;

  private callIndex: number = 0;

  public BEAM: null | BeamObject;

  private contract: Array<number> | null;

  private readonly callbacks: Map<string, BeamApiReqHandlers>;

  private eventManager:any;

  constructor(cid: string) {
    this.cid = cid;
    this.BEAM = null;
    this.contract = null;
    this.callbacks = new Map();
    window.addEventListener('message', this.messageResponses);
  }

  public readonly messageResponses = (e:MessageEvent<MessageType>) => {
    switch (e.data.type) {
      case 'ipc-control-res':
      case 'api-events':
        return this.responseCbackHandler(e.data.response);
      default:
        return null;
    }
  };

  private readonly responseCbackHandler = (parsed: ResultObject) => {
    console.log('response', parsed);
    const { id } = parsed;
    const cb = this.callbacks.get(id);
    this.callbacks.delete(id);
    if (cb) {
      if (parsed.error) return cb.reject(new Error(parsed.error.message));
      return cb.resolve(parsed);
    } return this.eventManager(parsed);
  };

  public readonly loadApiEventManager = (eventManager: any) => {
    this.eventManager = eventManager;
  };

  public readonly isApiLoaded = () => Boolean(this.BEAM);

  public isElectron = () => {
    const ua = navigator.userAgent;
    return /SOURC3-DESKTOP/i.test(ua);
  };

  public isHeadless = () => this.BEAM?.headless;

  public readonly loadAPI = async (): Promise<BeamApiDesktop<T>> => this;

  readonly initContract = async (shader: string) => {
    const contract = await fetch(shader)
      .then((response) => response.arrayBuffer());
    this.initShader(contract);
  };

  readonly initShader = (shader: ArrayBuffer): void => {
    this.contract = Array.from(new Uint8Array(shader));
  };

  readonly isNoContractMethod = (
    method:string
  ):boolean => !(
    /(tx_status|get_utxo|tx_split|ev_subunsub|ipfs_get)/i.test(method)
  );

  readonly callApi = (
    {
      callID, method, params, isContractInit
    }: CallApiProps<T>
  ): Promise<ResultObject> => {
    const id = [callID, this.callIndex++].join('-');
    const modifiedParams = { ...params } as Modified<T>;

    if (this.isNoContractMethod(method)) {
      if (this.contract && isContractInit) {
        modifiedParams.contract = this.contract;
      }
      if (params && 'args' in params) {
        modifiedParams.args = this.argsStringify(
          { ...(modifiedParams.args || {}) as ArgsObjectType, cid: this.cid }
        );
      }
    }
    const request = {
      jsonrpc: '2.0',
      id,
      method,
      params: modifiedParams
    };
    console.log('request', request);
    return this.callIPC('/beam', 'post', request, id);
  };

  public readonly callIPC = (
    url: string,
    method: IpcMethod,
    body = {},
    callId?:string
  ):Promise<ResultObject> => new Promise((resolve, reject) => {
    const id = callId || [url, this.callIndex++].join('-');
    window.postMessage({
      id,
      type: 'ipc-control-req',
      url,
      method,
      body
    });
    this.callbacks.set(id, { resolve, reject });
  });

  private readonly argsStringify = (
    args: { [key:string]: string | number }
  ): string => Object.entries(args)
    .filter((arg) => String(arg[1]).length)
    .map((arg) => arg.join('='))
    .join(',');
}
