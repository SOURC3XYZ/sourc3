import { AppThunkDispatch } from '@libs/redux';
import { BeamApiRes } from '@types';
import { AC } from './action-creators';

export const errorHandler = (dispatch: AppThunkDispatch) => (
  handler: (res: BeamApiRes) => void
) => (res: BeamApiRes) => {
  if (res.error) {
    dispatch(AC.setError({
      code: res.error.code,
      message: res.error.message,
      status: 'bad request'
    }));
  } else {
    handler(res);
  }
};
