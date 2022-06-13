import { clipString } from '@libs/utils';
import {
  Branch,
  BranchCommit,
  RepoCommitResp,
  RepoRefsResp,
  BranchName
} from '@types';
import { RC } from '@libs/action-creators';
import AbstractParser, { ParserProps } from './abstract-parser';

type CommitsMap = {
  commitMap: Map<string, BranchCommit>;
  branches: Branch[]
};

export default class CommitMapParser extends AbstractParser {
  private readonly commitMap: CommitsMap['commitMap'];

  private readonly branches: Branch[];

  private readonly repoMap = new Map<string, BranchCommit[]>();

  constructor(parserProps: ParserProps & CommitsMap) {
    super(parserProps);
    this.commitMap = parserProps.commitMap;
    this.branches = parserProps.branches;
  }

  private readonly getCommitParent = async (oid: string) => {
    const key = new Request(`/commit/${oid}`);

    const cachedCommit = await caches.match(key);
    if (cachedCommit) {
      const blob = await cachedCommit.blob();
      const json = await blob.text();
      return JSON.parse(json) as BranchCommit;
    }
    const res = this.isIpfsHash(oid)
      ? await this.getIpfsData<RepoCommitResp>(oid)
      : await this.call<RepoCommitResp>(RC.repoGetCommit(this.id, oid));
    const commit = new Blob([JSON.stringify(res.commit)], { type: 'application/json' });
    const init = { status: 200, statusText: 'OK!' };
    const response = new Response(commit, init);
    this.cache.put(key, response);
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
    } return commitList;
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

  private readonly repoList = (name:string, commitHash:string, commitArr: Set<string>) => {
    const commit = this.commitMap.get(commitHash) as BranchCommit;
    commitArr.add(commit.commit_oid);
    commit.parents.forEach((el) => this.repoList(name, el.oid, commitArr));
  };

  private readonly branchRepoCommit = (hash:string) => this.commitMap.get(hash) as BranchCommit;

  private readonly buildSync = async () => {
    this.branches.forEach((el) => {
      const commitArr = new Set(el.commit_hash);
      this.repoList(el.name, el.commit_hash, commitArr);
      console.log(el.name, Array.from(commitArr));
      this.repoMap.set(el.name, Array.from(commitArr).map(this.branchRepoCommit));
    });
    return this.repoMap;
  };

  public readonly buildCommitTree = async () => {
    const repoMap = await this.buildRepoMap();
    // const repoMap = this.buildSync();
    return repoMap;
  };
}
