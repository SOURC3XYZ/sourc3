import { ResultObject } from '@types';

export type ApiResultWeb = ((callback: (arg: string) => void) => void);

export type CallApiDesktop = (json: string) => void;

export type CallApiWeb<T> = (args: T) => void;

export type BeamApiMethods<T> = {
  api?: any;
  headless?:boolean;
  callWalletApiResult: ApiResultWeb;
  callWalletApi: CallApiWeb<string> | CallApiDesktop;
  callApi: (callid: string, method: string, params: T) => void;
  initializeShader: (contract: string, name: string) => void;
  delete: () => void;
};

type ArgsObjectType = { [key:string]: string | number };

type Modified<T> = T & {
  contract: Array<number>, args: string | ArgsObjectType, hash?:string };

type CallApiProps<T> = {
  callID: string;
  method: string;
  params: T;
  isContractInit?: boolean
};

type BeamApiReqHandlers = {
  resolve: (value: ResultObject) => void,
  reject: (reason?: any) => void
};

export type BeamObject<T> = {
  api: BeamApiMethods<T>,
  headless?: boolean,
  module?: any,
  factory?: any,
  client?: any,
  appid?: any,
};

export abstract class BeamAPI<T> {
  public readonly cid: string;

  protected readonly callbacks: Map<string, BeamApiReqHandlers> = new Map();

  protected callIndex: number = 0;

  protected BEAM: null | BeamObject<T> = null;

  protected contract: Array<number> | null = null;

  protected eventManager:any;

  constructor(cid: string) {
    this.cid = cid;
  }

  public isDapps = () => {
    const ua = navigator.userAgent;
    return /QtWebEngine/i.test(ua);
  };

  public isElectron = () => {
    const ua = navigator.userAgent;
    return /SOURC3-DESKTOP/i.test(ua);
  };

  public isHeadless = () => this.BEAM?.headless;

  public readonly loadApiEventManager = (eventManager: any) => {
    this.eventManager = eventManager;
  };

  public readonly isApiLoaded = () => Boolean(this.BEAM);

  public readonly initContract = async (shader: string) => {
    const contract = await fetch(shader)
      .then((response) => response.arrayBuffer());
    this.initShader(contract);
  };

  public readonly initShader = (shader: ArrayBuffer): void => {
    this.contract = Array.from(new Uint8Array(shader));
  };

  protected readonly responseCbackHandler = (parsed: ResultObject) => {
    console.log('response', parsed);
    const { id } = parsed;
    const cb = this.callbacks.get(id);
    this.callbacks.delete(id);
    if (cb) {
      if (parsed.error) return cb.reject(new Error(parsed.error.message));
      return cb.resolve(parsed);
    } return this.eventManager(parsed);
  };

  protected readonly onApiResult = (json: string): void => {
    const parsed = JSON.parse(json);
    this.responseCbackHandler(parsed);
  };

  protected readonly isNoContractMethod = (
    method:string
  ):boolean => !(
    /(tx_status|get_utxo|tx_split|ev_subunsub|ipfs_get)/i.test(method)
  );

  protected readonly modifyParams = (
    {
      callID, method, params, isContractInit = false
    }: CallApiProps<T>
  ) => {
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

    return {
      jsonrpc: '2.0',
      id,
      method,
      params: modifiedParams
    };
  };

  private readonly argsStringify = (
    args: { [key:string]: string | number }
  ): string => Object.entries(args)
    .filter((arg) => String(arg[1]).length)
    .map((arg) => arg.join('='))
    .join(',');

  protected abstract connectToApi: () => Promise<BeamObject<T>>;

  protected abstract messageResponses:(e:MessageEvent) => Promise<void> | void | null;

  public abstract callApi: (obj: CallApiProps<T>) => Promise<ResultObject>;

  abstract loadAPI: () => Promise<typeof this>;
}
