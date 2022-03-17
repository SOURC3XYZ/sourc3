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

const headlessNode = 'eu-node01.masternet.beam.mw:8200';

type BeamApiReqHandlers = {
  resolve: (value: BeamApiRes) => void,
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
  contract: Array<number>, args: string | ArgsObjectType };

export class BeamAPI<T> {
  public readonly cid: string;

  private apiHost?: string;

  private BEAM: null | BeamObject;

  private contract: Array<number> | null;

  private readonly callbacks: Map<string, BeamApiReqHandlers>;

  constructor(cid: string) {
    this.cid = cid;
    this.BEAM = null;
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

  createHeadlessAPI = async (
    apiver:any, apivermin:any, appname:any, apirescback:any
  ): Promise<BeamObject> => {
    const WasmModule = await window.BeamModule();
    const { WasmWalletClient } = WasmModule;
    const client = new WasmWalletClient(headlessNode);
    client.startWallet();

    client.subscribe((response:any) => {
      const err = `Unexpected wasm wallet client response call: ${response}`;
      console.log(err);
      throw new Error(err);
    });

    client.setApproveContractInfoHandler((info:any) => {
      const err = `Unexpected wasm wallet client transaction in headless wallet: ${info}`;
      console.log(err);
      throw new Error(err);
    });

    return new Promise((resolve, reject) => {
      const appid = WasmWalletClient
        .GenerateAppID(appname, window.location.href);

      client.createAppAPI(
        apiver, apivermin, appid, appname, (err:any, api:any) => {
          if (err) {
            reject(err);
          }

          api.setHandler(apirescback);
          resolve({
            headless: true,
            module: WasmModule,
            factory: WasmWalletClient,
            client,
            appid,
            api: api as QObject
          });
        }
      );
    });
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

  readonly connectHeadless = async () => {
    this.BEAM = await this.createHeadlessAPI(
      'current', '', 'bla', this.onApiResult
    );
    return this;
  };

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

  public isDapps = () => {
    const ua = navigator.userAgent;
    return /QtWebEngine/i.test(ua);
  };

  public isElectron = () => {
    const ua = navigator.userAgent;
    return /SOURC3-DESKTOP/i.test(ua);
  };

  readonly loadAPI = async (apiHost?:string): Promise<BeamAPI<T>> => {
    this.apiHost = apiHost;

    if (!this.apiHost) {
      try {
        this.BEAM = this.isDapps()
          ? { api: await this.connectToApi() }
          : await this.createHeadlessAPI(
            'current', '', 'bla', this.onApiResult
          );
      } catch {
        throw new Error('beam api connection error');
      }
    }
    return this;
  };

  readonly extensionConnect = async (message: {
    [key: string]: string;
  }) => {
    try {
      this.BEAM = { api: await this.connectToWebWallet(message) };
    } catch {
      throw new Error('extension connection error');
    }
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

    // webApi
    if (window.BeamApi) {
      return window.BeamApi.callWalletApi(
        id, method, { ...params, contract: this.contract }
      );
    }

    // headless
    if (this.BEAM?.headless) {
      return (
        this.BEAM?.api.callWalletApi as CallApiDesktop
      )(JSON.stringify(request));
    }

    // desktop
    return (
      this.BEAM?.api.callWalletApi as CallApiDesktop
    )(JSON.stringify(request));
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
