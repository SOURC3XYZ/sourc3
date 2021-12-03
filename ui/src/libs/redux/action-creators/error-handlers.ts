import { BeamApiRes } from '@types';
import { AppThunkDispatch } from '../store';
import AC from './action-creators';

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
