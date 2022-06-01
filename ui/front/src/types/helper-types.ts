import { AppThunkDispatch } from '@libs/redux';
import { CallApiProps } from '@types';

export type ErrorHandler = (err: Error) => void;

export type PromiseArg<T> = (reason?: T) => void;

export type ArgumentTypes<F extends Function> = F extends (...args: infer A) => any ? A : never;

export type OwnerListType = 'all' | 'my';

export type Entries<T> = { [K in keyof T]: [K, T[K]]; }[keyof T][];

export type CallBeamApi = ({ callID, method, params }: CallApiProps<unknown>) => Promise<any>;

export type IpcMethod = 'get' | 'post' | 'put' | 'delete';

export type ApiConnecting = (dispatch: AppThunkDispatch) => Promise<void>;

export type BeamApiContext = {
  setIsConnected: ApiConnecting,
  callApi: CallBeamApi,
  connectExtension?: ApiConnecting,
  isWebHeadless?: () => boolean,
  callIPC?: (url: string, method: IpcMethod, body?: {}, callId?: string) => Promise<any>
} | null;
