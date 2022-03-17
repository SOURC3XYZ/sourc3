export type QWebChannelTransport = {
  webChannelTransport: WebSocket
};

export type ApiResultWeb = ((callback: (arg: string) => void) => void);

export type ApiResult = {
  connect: (callback: (arg: string) => void) => void;
  disconnect: (callback: (arg: string) => void) => void;
};

export type CallApiDesktop = (json: string) => void;

export type CallApiWeb = (
  callid: string, method: string, params: {
    [key:string]:string | number | boolean | number[] }) => void;

export type QObject = {
  api?: any; // TODO: rewrite connections
  headless?:boolean;
  callWalletApiResult: ApiResult | ApiResultWeb;
  callWalletApi: CallApiWeb | CallApiDesktop;
  callApi: (callid: string, method: string, params: {
    [key:string]:string | number | boolean | number[] }) => void;
  initializeShader: (contract: string, name: string) => void;
};

export type QBEAM = {
  api: QObject;
};
