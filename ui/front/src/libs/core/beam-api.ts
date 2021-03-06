import { CONTRACT, ToastMessages, WALLET } from '@libs/constants';
import {
  QObject, ApiResult, CallApiDesktop, ResultObject
} from '@types';
import { QWebChannel } from 'qwebchannel';

type ArgsObjectType = { [key:string]: string | number };

type CallApiProps<T> = {
  callID: string;
  method: string;
  params: T;
};

type MessageType = {
  type: string;
  response: ResultObject
};

type IpcMethod = 'get' | 'post' | 'put' | 'delete';

const headlessNode = 'eu-node01.masternet.beam.mw:8200';

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

export class BeamAPI<T> {
  public readonly cid: string;

  private isHeadlessOnConnect = false;

  private callIndex: number = 0;

  private apiHost?: string;

  private BEAM: null | BeamObject;

  private contract: Array<number> | null;

  private readonly callbacks: Map<string, BeamApiReqHandlers>;

  private eventManager:any;

  private walletConnectResolve: ((obj: QObject) => void) | null = null;

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
      case 'apiInjected':
        console.log('injected');
        return this.afterWalletConnectHandler();
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

  private readonly onApiResult = (json: string): void => {
    const parsed = JSON.parse(json);
    this.responseCbackHandler(parsed);
  };

  public readonly loadApiEventManager = (eventManager: any) => {
    this.eventManager = eventManager;
  };

  public readonly isApiLoaded = () => Boolean(this.BEAM);

  createHeadlessAPI = async (
    apiver:any,
    apivermin:any,
    appname:any,
    apirescback:any
  ): Promise<BeamObject> => {
    if (this.isElectron()) {
      await this.injectScript('./wasm-client.js');
    } else {
      await this.injectScript('/wasm-client.js');
    }
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

      client.createAppAPI(apiver, apivermin, appid, appname, (err:any, api:any) => {
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
      });
    });
  };

  private afterWalletConnectHandler = async () => {
    if (window.BeamApi) {
      await window.BeamApi
        .callWalletApiResult(this.onApiResult);
      const activeUser = await window.BeamApi.localStorage();
      console.log(activeUser);
      if (this.walletConnectResolve) this.walletConnectResolve(window.BeamApi);
    }
  };

  private readonly connectToWebWallet = (
    message: { [key: string]: string }
  ) => new Promise<QObject>((resolve) => {
    // const updMessage = { ...message, is_reconnect: !!window.BeamApi };
    this.walletConnectResolve = resolve;
    window.postMessage(message, window.origin);
  });

  readonly connectHeadless = async () => {
    this.isHeadlessOnConnect = true;
    const beam = await this.createHeadlessAPI('current', '', 'SOURC3', this.onApiResult);
    return beam;
  };

  readonly connectToApi = async (): Promise<QObject> => {
    const { qt } = window;
    const api = await new Promise<QObject>(
      (resolve) => new QWebChannel(
        qt.webChannelTransport,
        (channel) => resolve(channel.objects.BEAM.api)
      )
    );
    (<ApiResult>api.callWalletApiResult).connect(this.onApiResult);
    return api;
  };

  injectScript = async (url:string) => new Promise<void>((resolve, reject) => {
    const js = document.createElement('script');
    js.type = 'text/javascript';
    js.async = true;
    js.src = url;
    js.onload = () => resolve();
    js.onerror = (err) => reject(err);
    document.getElementsByTagName('body')[0].appendChild(js);
  });

  public isDapps = () => {
    const ua = navigator.userAgent;
    return /QtWebEngine/i.test(ua);
  };

  public isElectron = () => {
    const ua = navigator.userAgent;
    return /SOURC3-DESKTOP/i.test(ua);
  };

  public isHeadless = () => this.BEAM?.headless;

  readonly loadAPI = async (apiHost?:string): Promise<BeamAPI<T>> => {
    this.apiHost = apiHost;
    if (!this.apiHost) {
      this.BEAM = this.isDapps()
        ? { api: await this.connectToApi() }
        : await this.connectHeadless();
    }
    return this;
  };

  readonly checkExtensionInstalled = () => document
    .documentElement.getAttribute('sourc3-extension-installed');

  readonly extensionConnect = async (message: {
    [key: string]: any;
  }) => this.extensionConnectHandler(message);

  readonly extensionConnectHandler = async (message: {
    [key: string]: string;
  }) => {
    if (!this.checkExtensionInstalled()) {
      window.open(WALLET.EXT_DOWNLOAD);
      throw new Error(ToastMessages.EXT_ERR_MSG);
    }

    // if (this.walletConnectResolve) {
    //   throw new Error(ToastMessages.EXT_ON_CONN_ERR);
    // }

    const api = await this.connectToWebWallet(message);
    if (api && this.isHeadless()) {
      this.BEAM?.api.delete();
      await new Promise((resolve) => {
        this.BEAM?.client.stopWallet(resolve);
      });
    }
    this.BEAM = { api };
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

  readonly isNoContractMethod = (
    method:string
  ):boolean => !(
    /(tx_status|get_utxo|tx_split|ev_subunsub|ipfs_get)/i.test(method)
  );

  readonly callApi = (
    { callID, method, params }: CallApiProps<T>
  ): Promise<ResultObject> => {
    const id = [callID, this.callIndex++].join('-');
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
    if (this.isElectron()) {
      const request = {
        jsonrpc: '2.0',
        id,
        method,
        params: modifiedParams
      };
      console.log('request', request);
      return this.callIPC('/beam', 'post', request, id);
    }

    return new Promise<ResultObject>(
      this.callApiHandler(id, method, modifiedParams)
    );
  };

  private readonly callApiHandler = (
    id:string,
    method:string,
    params: Modified<T>
  ) => (
    resolve:BeamApiReqHandlers['resolve'],
    reject:BeamApiReqHandlers['reject']
  ) => {
    const request = {
      jsonrpc: '2.0',
      id,
      method,
      params
    };
    console.log('request', request);

    this.callbacks.set(id, { resolve, reject });

    // webApi
    if (window.BeamApi) {
      if (request.method === 'ipfs_get' && request.params.hash) {
        return this.fetchIpfs(resolve, reject, request.params.hash);
      }
      return window.BeamApi.callWalletApi(id, method, { ...params });
    }

    // headless
    if (this.BEAM?.headless) {
      if (request.method === 'ipfs_get' && request.params.hash) {
        return this.fetchIpfs(resolve, reject, request.params.hash);
      }
      return (
        this.BEAM?.api.callWalletApi as CallApiDesktop
      )(JSON.stringify(request));
    }

    // desktop
    return (
      this.BEAM?.api.callWalletApi as CallApiDesktop
    )(JSON.stringify(request));
  };

  private readonly fetchIpfs = (
    resolve:BeamApiReqHandlers['resolve'],
    reject:BeamApiReqHandlers['reject'],
    hash: string
  ) => {
    const oReq = new XMLHttpRequest();
    oReq.open('GET', [CONTRACT.IPFS_HOST, 'ipfs', hash].join('/'), true);
    oReq.responseType = 'blob';
    oReq.setRequestHeader('Access-Control-Allow-Origin', '*');
    oReq.onload = async function () {
      const blob = oReq.response as Blob;
      const buffer = await blob.arrayBuffer();
      const result = {} as ResultObject;
      result.data = Array.from(new Uint8Array(buffer));
      resolve(
        {
          id: hash,
          jsonrpc: '1.0',
          result
        }
      );
    };

    oReq.send();
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
