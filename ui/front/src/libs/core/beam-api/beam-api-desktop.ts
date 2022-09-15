import { RequestSchema } from '@libs/action-creators';
import {
  IpcMethod, ResultObject
} from '@types';
import { BeamAPI } from './beam-api-abstract';

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

export class BeamApiDesktop extends BeamAPI<RequestSchema['params']> {
  constructor(cid: string) {
    super(cid);
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

  public readonly loadApiEventManager = (eventManager: any) => {
    this.eventManager = eventManager;
  };

  public readonly isApiLoaded = () => Boolean(this.BEAM);

  public readonly loadAPI = async () => this;

  protected readonly connectToApi = () => {
    const beam = this.BEAM;
    return Promise.resolve(beam as NonNullable<typeof beam>);
  };

  readonly callApi = (req: CallApiProps<RequestSchema['params']>): Promise<ResultObject> => {
    const request = this.modifyParams(req);
    console.log('request', request);
    return this.callIPC('/beam', 'post', request, request.id);
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
}
