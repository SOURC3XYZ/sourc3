import { RequestSchema } from '@libs/action-creators';
import { CONFIG, ToastMessages } from '@libs/constants';
import { ResultObject, User } from '@types';
import { NavigateFunction } from 'react-router-dom';
import { BeamAPI, BeamApiMethods, BeamObject } from './beam-api-abstract';

type CallApiProps<T> = {
  callID: string;
  method: string;
  params: T;
  isContractInit?: boolean
};

type MessageType = {
  type: string;
  response: ResultObject
  items: User[]
};

type BeamApiReqHandlers = {
  resolve: (value: ResultObject) => void,
  reject: (reason?: any) => void
};

type ExtensionResolveObj = { api: BeamApiMethods<RequestSchema['params']>, users: User[] };

export class BeamWebAPI extends BeamAPI<RequestSchema['params']> {
  private setPidEventManager: ((items: User[]) => void) | null = null;

  private walletConnectResolve: ((obj: ExtensionResolveObj) => void) | null = null;

  private navigate: NavigateFunction;

  constructor(cid: string, navigate: NavigateFunction) {
    super(cid);
    this.navigate = navigate;
    window.addEventListener('message', this.messageResponses);
  }

  public readonly loadSetPidEventManager = (setPidEventManager: any) => {
    this.setPidEventManager = setPidEventManager;
  };

  public readonly loadAPI = async () => {
    this.BEAM = await this.connectHeadless();
    return this;
  };

  public readonly extensionConnect = async (message: {
    [key: string]: any;
  }) => this.extensionConnectHandler(message);

  public readonly callApi = (
    req: CallApiProps<RequestSchema['params']>
  ): Promise<ResultObject> => new Promise<ResultObject>(this.callApiHandler(req));

  protected readonly messageResponses = (e:MessageEvent<MessageType>) => {
    switch (e.data.type) {
      case 'set-pid':
        if (this.setPidEventManager) return this.setPidEventManager(e.data.items);
        return null;
      case 'apiInjected':
        console.log('injected');
        return this.afterWalletConnectHandler();
      default:
        return null;
    }
  };

  protected readonly connectToApi = async ():Promise<BeamObject<RequestSchema['params']>> => {
    const apiver = 'current';
    const apivermin = '';
    const appname = 'SOURC3';
    const apirescback = this.onApiResult;

    await this.injectScript('/wasm-client.js');

    const WasmModule = await window.BeamModule();
    const { WasmWalletClient } = WasmModule;
    const client = new WasmWalletClient(CONFIG.HEADLESS_NODE);
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
        if (err) reject(err);

        api.setHandler(apirescback);

        const res = {
          headless: true,
          module: WasmModule,
          factory: WasmWalletClient,
          client,
          appid,
          api
        };

        resolve(res);
      });
    });
  };

  private afterWalletConnectHandler = async () => {
    if (window.BeamApi) {
      await window.BeamApi
        .callWalletApiResult(this.onApiResult);
      const users = (await window.BeamApi.localStorage()).activePid;
      console.log(users);
      if (this.walletConnectResolve) this.walletConnectResolve({ api: window.BeamApi, users });
    }
  };

  private readonly connectToWebWallet = (
    message: { [key: string]: string }
  ) => new Promise<ExtensionResolveObj>((resolve) => {
    this.walletConnectResolve = resolve;
    window.postMessage(message, window.origin);
  });

  private readonly connectHeadless = async () => {
    const beam = await this.connectToApi();
    return beam;
  };

  private readonly injectScript = async (url:string) => new Promise<void>((resolve, reject) => {
    const js = document.createElement('script');
    js.type = 'text/javascript';
    js.async = true;
    js.src = url;
    js.onload = () => resolve();
    js.onerror = (err) => reject(err);
    document.getElementsByTagName('body')[0].appendChild(js);
  });

  private readonly checkExtensionInstalled = () => document
    .documentElement
    .getAttribute('sourc3-extension-installed');

  private readonly extensionConnectHandler = async (message: {
    [key: string]: string;
  }) => {
    if (!this.checkExtensionInstalled()) {
      this.navigate('/download');
      throw new Error(ToastMessages.EXT_ERR_MSG);
    }

    const { api, users } = await this.connectToWebWallet(message);
    if (api && this.isHeadless()) {
      this.BEAM?.api.delete();
      await new Promise((res) => this.BEAM?.client.stopWallet(res));
    }

    this.BEAM = { api };
    return users;
  };

  private readonly callApiHandler = (
    req: CallApiProps<RequestSchema['params']>
  ) => (resolve:BeamApiReqHandlers['resolve'], reject:BeamApiReqHandlers['reject']) => {
    const modified = this.modifyParams(req);
    console.log('request', modified);

    this.callbacks.set(modified.id, { resolve, reject });

    if (modified.method === 'ipfs_get' && modified.params.hash) {
      return this.fetchIpfs(resolve, reject, modified.params.hash);
    }
    if (window.BeamApi) {
      const { id, method, params } = modified;
      return window.BeamApi.callWalletApi(id, method, { ...params });
    } return this.BEAM?.api.callWalletApi(JSON.stringify(modified));
  };

  private readonly fetchIpfs = (
    resolve:BeamApiReqHandlers['resolve'],
    reject:BeamApiReqHandlers['reject'],
    hash: string
  ) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', [CONFIG.IPFS_HOST, 'ipfs', CONFIG.NETWORK, hash].join('/'), true);
    xhr.responseType = 'blob';
    xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
    xhr.onload = async function () {
      const blob = xhr.response as Blob;
      const buffer = await blob.arrayBuffer();
      const result = {} as ResultObject;
      result.data = Array.from(new Uint8Array(buffer));
      resolve({
        id: hash,
        jsonrpc: '1.0',
        result
      });
    };

    xhr.onloadend = function () {
      if (xhr.status === 404) { reject(new Error('hash not found')); }
    };
    xhr.send();
  };
}
