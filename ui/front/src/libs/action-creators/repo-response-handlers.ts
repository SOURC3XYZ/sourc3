import { AppThunkDispatch } from '@libs/redux';
import { BeamApiRes, EventResult } from '@types';
import { thunks } from '@libs/action-creators';

export function apiEventManager(dispatch: AppThunkDispatch) {
  return function ({ result }:BeamApiRes<EventResult>) {
    const isInSync = !result.is_in_sync
    || result.tip_height !== result.current_height;
    if (isInSync) return;
    // we're not in sync, wait

    dispatch(thunks.getAllRepos('all'));
    dispatch(thunks.getOrganizations());
    dispatch(thunks.getProjects());
    dispatch(thunks.getWalletStatus());
    dispatch(thunks.getTxList());
  };
}
