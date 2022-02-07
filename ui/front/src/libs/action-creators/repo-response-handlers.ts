import { BeamAPI } from '@libs/beam';
import { clipString, treeDataMaker, updateTreeData } from '@libs/utils';
import {
  BeamApiRes,
  Branch,
  BranchCommit,
  RepoCommitResp,
  RepoId, RepoRefsResp,
  RepoTreeResp, TreeDataNode,
  UpdateProps, BranchName
} from '@types';
import { AC } from './action-creators';
import { RC, RequestCreators } from './request-creators';

type TypedBeamApi = BeamAPI<RequestCreators['params']>;

type CallType<T> = (req: RequestCreators) => Promise<T>;

export const callApi = (
  beam: TypedBeamApi
) => async function<T>(req: RequestCreators):Promise<T> {
  const { result } = await beam.callApi(req) as BeamApiRes;
  if (result?.output) return JSON.parse(result.output) as T;
  throw new Error('something wrong with output');
};

const getCommitParent = async (
  call: CallType<RepoCommitResp>,
  id: RepoId, oid: string
) => {
  const res = await call(
    RC.repoGetCommit(id, oid)
  );
  return res.commit;
};

export const buildCommitList = async (
  call: CallType<RepoCommitResp>,
  id: RepoId,
  workingStack: BranchCommit[], commitList:BranchCommit[] = []
):Promise<BranchCommit[]> => {
  if (workingStack.length) {
    const commit = workingStack.pop() as BranchCommit;
    commitList.push(commit);
    const parentCommits = await Promise.all(
      commit.parents
        .map((el) => getCommitParent(call, id, el.oid))
    );
    workingStack.push(...parentCommits);
    return buildCommitList(call, id, workingStack, commitList);
  }
  return commitList.reverse();
};

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

const getCommit = async (
  call: CallType<RepoCommitResp>, id: RepoId, branch: Branch
):Promise<BranchCommit[]> => {
  const commitRes = await call(RC.repoGetCommit(id, branch.commit_hash));
  const commitList = await buildCommitList(call, id, [commitRes.commit]);
  return commitList;
};

export async function buildRepoMap(api:TypedBeamApi, id:RepoId) {
  const call = callApi(api);
  const branches = await call<RepoRefsResp>(RC.repoGetRefs(id));
  const branchMap = new Map<BranchName, BranchCommit[]>();
  const promises = branches.refs.map((el) => getCommit(call, id, el));
  const commits = await Promise.all(promises);
  branches.refs.forEach((el, i) => {
    if (commits[i]) branchMap.set(clipString(el.name), commits[i]);
  });
  return branchMap.size ? branchMap : null;
}

export async function repoReq(
  id: RepoId, beam: TypedBeamApi
) {
  const repoMap = await buildRepoMap(beam, id);
  return [
    AC.setRepoId(id),
    AC.setRepoMap(repoMap),
    AC.setTreeData(null)
  ];
}
