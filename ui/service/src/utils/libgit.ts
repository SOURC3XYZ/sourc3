/* eslint-disable no-await-in-loop */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-continue */
import {
  Blob, Clone, Commit, FetchOptions, Oid, Reference, Repository, Tree
} from 'nodegit';
import { isExistsSync } from './file-handlers';

export enum Action {
  Cloned,
  Opened
}

type AsyncInitParams = {
  promise: Promise<Repository>,
  action: Action
};

export class GitHandler {
  private readonly url: string;

  private readonly localPath: string;

  private asyncInitParams: AsyncInitParams;

  private repo: Repository;

  public constructor(
    url: string,
    localPath: string
  ) {
    this.url = url;
    this.localPath = localPath;
    this.asyncInitParams = isExistsSync(this.localPath, '.git')
      ? { promise: Repository.open(localPath), action: Action.Opened }
      : { promise: Clone.clone(this.url, localPath), action: Action.Cloned };
  }

  public getContents = async () => {
    this.repo = await this.asyncInitParams.promise;
    return {
      repo: this.repo, action: this.asyncInitParams.action
    };
  };

  public getBranches = async () => {
    const refs = await this.repo.getReferences();
    return refs;
  };

  public getRecentCommit = async (ref: Reference) => {
    const commit = await this.repo.getBranchCommit(ref);
    return commit.id().tostrS();
  };

  public getCommits = async (oid: string) => {
    const head_branch_commit = await Commit.lookup(this.repo, oid);
    const working_queue: Array<Oid> = [head_branch_commit.id()];

    const commit_oids = new Set<string>();
    const commits: Array<Commit> = [];
    while (working_queue.length > 0) {
      const working_commit = await Commit
        .lookup(this.repo, working_queue.pop() as Oid);
      const working_oid = working_commit.id().tostrS();
      if (commit_oids.has(working_oid)) {
        continue;
      }

      commit_oids.add(working_oid);
      commits.push(working_commit);
      for (const parent of working_commit.parents()) {
        working_queue.push(Oid.fromString(parent.tostrS()));
      }
    }

    return commits;
  };

  public getTreeEntries = async (treeOid: string | Oid) => {
    const tree = await Tree.lookup(this.repo, treeOid);
    return tree.entries();
  };

  public getBlobByOid = async (
    oid: string | Oid
  ) => Blob.lookup(this.repo, oid);

  public fetch = async (
    remote: string,
    fetchOptions: FetchOptions
  ) => this.repo.fetch(remote, fetchOptions);
}
