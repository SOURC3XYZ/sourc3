import { AppThunkDispatch } from '@libs/redux';
import {
  ErrorObj
} from '@types';
import { AxiosError } from 'axios';
import { AC } from './action-creators';

export const errorHandler = (errorObj: ErrorObj, dispatch?: AppThunkDispatch) => {
  if (dispatch) {
    dispatch(AC.setError({
      ...errorObj
    }));
  } throw new Error(errorObj.message);
};

export const thunkCatch = (err: unknown, dispatch?: AppThunkDispatch) => {
  const { message } = err as Error;
  console.error(err);
  if (dispatch) return errorHandler({ message }, dispatch);
  throw new Error(message);
};

export const isAxiosError = (
  x: any
): x is AxiosError => typeof x.response === 'object';

export const cbErrorHandler = (error: unknown, callback: (err?: Error) => void) => {
  if (isAxiosError(error)) {
    // eslint-disable-next-line no-unsafe-optional-chaining
    const { message } = error.response?.data;
    return callback(new Error(message));
  } return callback(error as Error);
};
