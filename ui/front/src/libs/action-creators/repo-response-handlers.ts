import { AppThunkDispatch } from '@libs/redux';
import { BeamApiRes } from '@types';
import { thunks } from '@libs/action-creators';

export function apiEventManager(dispatch: AppThunkDispatch) {
  return function ({ result }:BeamApiRes) {
    const isInSync = !result.is_in_sync
    || result.tip_height !== result.current_height;
    if (isInSync) return;
    // we're not in sync, wait

    dispatch(thunks.getAllRepos('all'));
    dispatch(thunks.getWalletStatus());
  };
}
