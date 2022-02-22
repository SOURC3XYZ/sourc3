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
  resolve: (value: BeamApiRes) => void,
  reject: (reason?: any) => void
};

type Modified<T> = T & {
  contract: Array<number>, args: string | ArgsObjectType };

export class BeamAPI<T> {
  public readonly cid: string;

  private readonly apiHost: string | null;

  private API: null | QObject;

  private contract: Array<number> | null;

  private readonly callbacks: Map<string, BeamApiReqHandlers>;

  constructor(cid: string, apiHost?:string) {
    this.cid = cid;
    this.apiHost = apiHost || null;
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
      if (parsed.error) cb.reject(new Error(parsed.error.message));
      else cb.resolve(parsed);
      this.callbacks.delete(id);
    } return undefined;
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
    if (!this.apiHost) {
      try {
        this.API = /QtWebEngine/i.test(ua)
          ? await this.connectToApi()
          : await this.connectToWebWallet(message);
      } catch {
        throw new Error();
      }
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
  ): Promise<BeamApiRes> => {
    const id = `${callID}(${new Date().getTime()})`;
    const modifiedParams = { ...params } as Modified<T>;
    if (this.isNoContractMethod(method)) {
      if (this.contract) {
        modifiedParams.contract = this.contract;
      }
      if (params && 'args' in params) {
        modifiedParams.args = this.argsStringify(
          { ...(modifiedParams.args || {}) as ArgsObjectType, cid: this.cid }
        );
      }
    }
    return new Promise<BeamApiRes>(
      this.callApiHandler(id, method, modifiedParams)
    );
  };

  private readonly callApiHandler = (
    id:string, method:string, params: Modified<T>
  ) => (
    resolve:BeamApiReqHandlers['resolve'], reject:BeamApiReqHandlers['reject']
  ) => {
    const request = {
      jsonrpc: '2.0',
      id,
      method,
      params
    };
    console.log('request', request);

    if (this.apiHost) {
      return this.fetchApi(resolve, reject, JSON.stringify(request));
    }

    this.callbacks.set(id, { resolve, reject });
    if (window.BeamApi) {
      return window.BeamApi.callWalletApi(
        id, method, { ...params, contract: this.contract }
      );
    }
    return (this.API?.callWalletApi as CallApiDesktop)(JSON.stringify(request));
  };

  private readonly fetchApi = (
    resolve:BeamApiReqHandlers['resolve'],
    reject:BeamApiReqHandlers['reject'],
    json: string
  ) => {
    if (this.apiHost) {
      fetch(this.apiHost, {
        method: 'POST',
        body: json,
        headers: { 'Content-Type': 'application/json' }
      }).then((response) => response.json())
        .then((data) => {
          console.log('response', data);
          resolve(data);
        })
        .catch((err) => reject(new Error(err)));
    }
  };

  private readonly argsStringify = (
    args: { [key:string]: string | number }
  ): string => Object.entries(args)
    .filter((arg) => String(arg[1]).length)
    .map((arg) => arg.join('='))
    .join(',');
}
