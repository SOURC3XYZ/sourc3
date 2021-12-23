import { BeamAPI } from '@libs/beam';
import { treeDataMaker, updateTreeData } from '@libs/utils';
import {
  BeamApiRes, RepoCommitResponse, RepoId, RepoRefsResponse, RepoTreeResponse, TreeDataNode, UpdateProps
} from '@types';
import { AC } from './action-creators';
import { RC, RequestCreators } from './request-creators';

type TypeBeamApi = BeamAPI<RequestCreators['params']>;

export const callApi = (
  beam: TypeBeamApi
) => async function<T>(req: RequestCreators):Promise<T> {
  const { result } = await beam.callApi(req) as BeamApiRes;
  if (result?.output) return JSON.parse(result.output) as T;
  throw new Error('something wrong with output');
};

export const getTree = async (beam: TypeBeamApi,
  {
    id, oid, key
  }: UpdateProps, tree: TreeDataNode[]) => {
  const call = callApi(beam);
  const res = await call<RepoTreeResponse>(RC.repoGetTree(id, oid));
  if (!res.error) {
    const updated = updateTreeData(
      tree, treeDataMaker(res.tree?.entries, key), key
    );
    return updated;
  }
  throw new Error('something wrong with output');
};

export async function repoReq(
  id: RepoId, tree:TreeDataNode[], beam: TypeBeamApi
) {
  const call = callApi(beam);
  const refOutput = await call<RepoRefsResponse>(RC.repoGetRefs(id));
  const commitRes = await call<RepoCommitResponse>(
    RC.repoGetCommit(id, refOutput?.refs[0].commit_hash)
  );
  const treeRes = await getTree(
    beam, { id, oid: commitRes.commit.tree_oid }, tree
  );
  return [
    AC.setRepoRefs(refOutput.refs),
    AC.setCommitData(commitRes.commit),
    AC.setCommitHash(refOutput.refs[0].commit_hash),
    AC.setTreeData(treeRes)
  ];
}
