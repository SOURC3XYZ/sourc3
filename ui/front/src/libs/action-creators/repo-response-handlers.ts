import { BeamAPI } from '@libs/beam';
import { AppThunkDispatch } from '@libs/redux';
import {
  BeamApiRes,
  RepoTreeResp,
  TreeDataNode,
  UpdateProps
} from '@types';
import {
  thunks, RC, RequestCreators
} from '@libs/action-creators';

type TypedBeamApi = BeamAPI<RequestCreators['params']>;

// type CallType<T> = (req: RequestCreators) => Promise<T>;

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

export function callApi(beam: TypedBeamApi) {
  return async function<T>(req: RequestCreators):Promise<T> {
    const { result } = await beam.callApi(req);
    if (result?.output) {
      return JSON.parse(result.output) as T;
    } return result as unknown as T;
  };
}

export const getTree = async (beam: TypedBeamApi,
  {
    id, oid, key
  }: UpdateProps, tree: TreeDataNode[]) => {
  const call = callApi(beam);
  const res = await call<RepoTreeResp>(RC.repoGetTree(id, oid));
  if (!res.error) {
    const updated = updateTreeData(
      tree, treeDataMaker(res.tree?.entries, key), key
    );
    return updated;
  }
  throw new Error('something wrong with output');
};
