import { RequestSchema } from '@libs/action-creators';
import { AppThunkDispatch } from '@libs/redux';
import { CallApiProps, ResultObject, User } from '@types';

export type ErrorHandler = (err: Error) => void;

export type PromiseArg<T> = (reason?: T) => void;

export type ArgumentTypes<F extends Function> = F extends (...args: infer A) => any ? A : never;

export type OwnerListType = 'all' | 'my';

export type Entries<T> = { [K in keyof T]: [K, T[K]]; }[keyof T][];

export type CallBeamApi<T> = (obj: CallApiProps<T>) => Promise<ResultObject>;

export type IpcMethod = 'get' | 'post' | 'put' | 'delete';

export type CallIPCType = (
  url: string, method: IpcMethod, body?: {}, callId?: string
) => Promise<any>;

export type ApiConnecting<T = void> = (dispatch: AppThunkDispatch) => Promise<T>;

export interface BeamApiContext {
  setIsConnected?: ApiConnecting,
  callApi: CallBeamApi<RequestSchema['params']>,
  connectExtension?: ApiConnecting<User[]>,
  isWebHeadless?: () => boolean,
  callIPC?: CallIPCType
}
