import { clipString } from '@libs/utils';
import {
  Branch,
  BranchCommit,
  RepoCommitResp,
  RepoRefsResp,
  BranchName
} from '@types';
import { RC } from '@libs/action-creators';
import AbstractParser from './abstract-parser';

export default class CommitMapParser extends AbstractParser {
  private readonly getCommitParent = async (oid: string) => {
    const res = this.isIpfsHash(oid)
      ? await this.getIpfsData<RepoCommitResp>(oid)
      : await this.call<RepoCommitResp>(RC.repoGetCommit(this.id, oid));
    return res.commit;
  };

  private readonly buildCommitList = async (
    workingStack: BranchCommit[],
    commitList:BranchCommit[] = [],
    commitIds: Set<string> = new Set()
  ):Promise<BranchCommit[]> => {
    if (workingStack.length) {
      const commit = workingStack.pop() as BranchCommit;
      commitIds.add(commit.commit_oid);
      commitList.push(commit);
      const parentCommits = await Promise.all(
        commit.parents.map(({ oid }) => this.getCommitParent(oid))
      );

      parentCommits.forEach((el) => {
        if (!commitIds.has(el.commit_oid)) workingStack.push(el);
      });

      return this.buildCommitList(workingStack, commitList, commitIds);
    } return commitList.reverse();
  };

  private readonly getCommit = async (
    branch: Branch
  ):Promise<BranchCommit[]> => {
    const commitResp = this.isIpfsHash(branch.commit_hash)
      ? await this.getIpfsData(branch.commit_hash) as RepoCommitResp
      : await this.call<RepoCommitResp>(
        RC.repoGetCommit(this.id, branch.commit_hash)
      );
    const commitList = await this.buildCommitList([commitResp.commit]);
    return commitList;
  };

  private readonly buildRepoMap = async () => {
    const branches = await this.call<RepoRefsResp>(RC.repoGetRefs(this.id));
    const branchMap = new Map<BranchName, BranchCommit[]>();
    const promises = branches.refs.map(this.getCommit);
    const commits = await Promise.all(promises);

    branches.refs.forEach((el, i) => {
      if (commits[i]) branchMap.set(clipString(el.name), commits[i]);
    });
    return branchMap.size ? branchMap : null;
  };

  public readonly buildCommitTree = async () => {
    const repoMap = await this.buildRepoMap();
    return repoMap;
  };
}
