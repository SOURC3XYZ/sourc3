import { AppThunkDispatch } from '@libs/redux';
import { BeamApiRes, ContractResponse, ErrorObj } from '@types';
import { AC } from './action-creators';

export const errorHandler = (
  errorObj: ErrorObj, dispatch: AppThunkDispatch
) => {
  dispatch(AC.setError({
    ...errorObj
  }));
};

export function outputParser<T extends ContractResponse>(
  res: BeamApiRes, dispatch: AppThunkDispatch
) {
  try {
    if (res.error) errorHandler(res.error, dispatch);
    if (res.result.output) {
      const output = JSON.parse(res.result.output) as T;
      if (output.error) dispatch(AC.setError({ message: output.error }));
      return output;
    } throw new Error('no output');
  } catch (error) {
    const { message } = error as Error;
    errorHandler({ message }, dispatch);
    return undefined;
  }
}
