import {
  QObject, BeamApiRes, ApiResultWeb, ApiResult, CallApiDesktop
} from '@types';
import { QWebChannel } from 'qwebchannel';

type ArgsObjectType = { [key:string]: string | number };

type CallApiProps<T> = {
  callID: string;
  method: string;
  params: T;
};

type BeamApiReqHandlers = {
  resolve: (value: unknown) => void,
  reject: (reason?: any) => void
};

type Modified<T> = T & {
  contract: Array<number>, args: string | ArgsObjectType };

export class BeamAPI<T> {
  private readonly cid: string;

  private API: null | QObject;

  private contract: Array<number> | null;

  private readonly callbacks: Map<string, BeamApiReqHandlers>;

  constructor(cid: string) {
    this.cid = cid;
    this.API = null;
    this.contract = null;
    this.callbacks = new Map();
  }

  private readonly onApiResult = (json: string): void => {
    const parsed = JSON.parse(json) as BeamApiRes;
    console.log('response', parsed);
    const { id } = parsed;
    const cb = this.callbacks.get(id);
    if (cb) {
      cb.resolve(parsed);
      this.callbacks.delete(id);
    }
  };

  private readonly connectToWebWallet = (
    message: { [key: string]: string }
  ) => new Promise<QObject>((resolve) => {
    window.addEventListener(
      'message',
      async (ev) => {
        if (window.BeamApi) {
          const webApiResult = window.BeamApi
            .callWalletApiResult as ApiResultWeb;
          if (ev.data === 'apiInjected') {
            await webApiResult(this.onApiResult);
            resolve(window.BeamApi);
          }
        }
      },
      false
    );
    window.postMessage(message, window.origin);
  });

  readonly connectToApi = async (): Promise<QObject> => {
    const { qt } = window;
    const api = await new Promise<QObject>(
      (resolve) => new QWebChannel(qt.webChannelTransport, (channel) => {
        resolve(channel.objects.BEAM.api);
      })
    );
    (<ApiResult>api.callWalletApiResult).connect(this.onApiResult);
    return api;
  };

  readonly loadAPI = async (message: {
    [key: string]: string;
  }): Promise<BeamAPI<T>> => {
    const ua = navigator.userAgent;
    try {
      this.API = /QtWebEngine/i.test(ua)
        ? await this.connectToApi()
        : await this.connectToWebWallet(message);
    } catch {
      throw new Error();
    }
    return this;
  };

  readonly initContract = async (
    shader: string
  ) => {
    const contract = await fetch(shader)
      .then((response) => response.arrayBuffer());
    this.initShader(contract);
  };

  readonly initShader = (shader: ArrayBuffer): void => {
    this.contract = Array.from(new Uint8Array(shader));
  };

  isNoContractMethod = (method:string):boolean => {
    if (!(/(tx_status|get_utxo|tx_split)/i.test(method))) return true;
    return false;
  };

  readonly callApi = (
    { callID, method, params }: CallApiProps<T>
  ): Promise<unknown> => {
    const id = `${callID}(${new Date().getTime()})`;
    const modifiedParams = { ...params } as Modified<T>;
    if (this.isNoContractMethod(method)) {
      if (this.contract) {
        modifiedParams.contract = this.contract;
      }
      if ('args' in params) {
        modifiedParams.args = this.argsStringify(
          { ...(modifiedParams.args || {}) as ArgsObjectType, cid: this.cid }
        );
      }
    }
    return new Promise(this.callApiHandler(id, method, modifiedParams));
  };

  private readonly callApiHandler = (
    id:string, method:string, params: Modified<T>
  ) => (
    resolve:BeamApiReqHandlers['resolve'], reject:BeamApiReqHandlers['reject']
  ) => {
    this.callbacks.set(id, { resolve, reject });

    const request = {
      jsonrpc: '2.0',
      id,
      method,
      params
    };
    console.log('request', request);
    if (window.BeamApi) {
      window.BeamApi
        .callWalletApi(id, method, { ...params, contract: this.contract });
    } else {
      (this.API?.callWalletApi as CallApiDesktop)(JSON.stringify(request));
    }
  };

  private readonly argsStringify = (
    args: { [key:string]: string | number }
  ): string => Object.entries(args)
    .filter((arg) => String(arg[1]).length)
    .map((arg) => arg.join('='))
    .join(',');
}
