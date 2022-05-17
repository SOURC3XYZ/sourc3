import { AppThunkDispatch } from '@libs/redux';
import {
  BeamApiRes, ContractResp, ContractResult, ErrorObj
} from '@types';
import { AxiosError } from 'axios';
import { AC } from './action-creators';

export const errorHandler = (errorObj: ErrorObj, dispatch: AppThunkDispatch) => {
  dispatch(AC.setError({
    ...errorObj
  }));
};

export const thunkCatch = (err: unknown, dispatch: AppThunkDispatch) => {
  const { message } = err as Error;
  console.error(err);
  errorHandler({ message }, dispatch);
};

export function outputParser<T extends ContractResp>(
  res: BeamApiRes<ContractResult>,
  dispatch: AppThunkDispatch
) {
  try {
    if (res.error) return errorHandler(res.error, dispatch);
    if (res.result.output) {
      const output = JSON.parse(res.result.output) as T;
      if (output.error) {
        return errorHandler({ message: output.error }, dispatch);
      }
      return output;
    } throw new Error('no output');
  } catch (error) {
    const { message } = error as Error;
    errorHandler({ message }, dispatch);
    return undefined;
  }
}

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
