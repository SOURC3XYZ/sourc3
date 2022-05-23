import { AppThunkDispatch } from '@libs/redux';
import { CallApiProps } from '@types';

export type ErrorHandler = (err: Error) => void;

export type PromiseArg<T> = (reason?: T) => void;

export type ArgumentTypes<F extends Function> = F extends (...args: infer A) => any ? A : never;

export type OwnerListType = 'all' | 'my';

export type Entries<T> = { [K in keyof T]: [K, T[K]]; }[keyof T][];

export type CallBeamApi = ({ callID, method, params }: CallApiProps<unknown>) => Promise<any>;

export type ApiConnecting = (dispatch: AppThunkDispatch) => Promise<void>;

export type BeamApiContext = {
  setIsConnected: ApiConnecting,
  connectExtension: ApiConnecting,
  callApi: CallBeamApi,
  isWebHeadless: () => boolean,
} | null;
