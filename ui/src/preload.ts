/* eslint-disable import/no-extraneous-dependencies */
import { IpcClient } from 'ipc-express';
import { ipcRenderer } from 'electron';

const ipc = new IpcClient(ipcRenderer);

enum IPCTypes {
  CONTROL_REQ = 'ipc-control-req',
  CONTROL_RES = 'ipc-control-res',
  SELECT_DIRS = 'select-dirs'
}

export type BeamApiResult = {
  ipc: any
};

type IpcMethod = 'get' | 'post' | 'put' | 'delete';

type IpcRequest = {
  id: string;
  type: IPCTypes,
  url: string,
  method: IpcMethod,
  body: any
};

type IpcRequestEvent = MessageEvent<IpcRequest>;

export interface BeamApiResponse {
  id: string;
  jsonrpc: string;
  method?: string;
  result?: BeamApiResult;
  error?: {
    code:number;
    message: string;
  }
}

  type MessageType = {
    type: string;
    response: BeamApiResponse
  };

  type IpcResponse = {
    data: {
      [key:string]:any,
      id?: string,
      result?:any,
      method?:string
    },
    statusCode: number,
  };

process.once('loaded', () => {
  const sendToRenderProcess = (message: MessageType) => {
    window.postMessage(message);
  };
  window.addEventListener('message', async (evt:IpcRequestEvent) => {
    if (evt.data.type === IPCTypes.SELECT_DIRS) {
      console.log('kek');
      ipcRenderer.send('select-dirs');
    }
    if (evt.data.type === IPCTypes.CONTROL_REQ) {
      const res = await ipc[evt.data.method](evt.data.url, evt.data.body) as IpcResponse;
      console.log(res);
      const response = {
        id: evt.data.id,
        jsonrpc: '2.0'
      } as BeamApiResponse;
      if (res.statusCode === 201) {
        response.result = res.data.id ? res.data.result : { ipc: res.data };
        if (res.data.method) response.method = res.data.method;
      } else response.error = { code: res.statusCode, message: JSON.stringify(res) };

      return sendToRenderProcess({ type: IPCTypes.CONTROL_RES, response });
    } return null;
  });

  ipcRenderer.on('ping', (_, message) => {
    console.log('ping', message);
    if (message.id?.match(/ev_/i)) {
      window.postMessage({
        type: 'api-events',
        response: message
      });
    }
    window.postMessage({
      type: 'select-dirs-answer',
      path: message
    });
  });
});
