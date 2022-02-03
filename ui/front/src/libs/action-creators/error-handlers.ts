import { AppThunkDispatch } from '@libs/redux';
import { BeamApiRes, ContractResp, ErrorObj } from '@types';
import { AC } from './action-creators';

export const errorHandler = (
  errorObj: ErrorObj, dispatch: AppThunkDispatch
) => {
  dispatch(AC.setError({
    ...errorObj
  }));
};

export const thunkCatch = (err: unknown, dispatch: AppThunkDispatch) => {
  const { message } = err as Error;
  errorHandler({ message }, dispatch);
};

export function outputParser<T extends ContractResp>(
  res: BeamApiRes, dispatch: AppThunkDispatch
) {
  try {
    if (res.error) return errorHandler(res.error, dispatch);
    if (res.result.output) {
      const output = JSON.parse(res.result.output) as T;
      if (output.error) {
        return errorHandler(
          { message: output.error }, dispatch
        );
      }
      return output;
    } throw new Error('no output');
  } catch (error) {
    const { message } = error as Error;
    errorHandler({ message }, dispatch);
    return undefined;
  }
}
