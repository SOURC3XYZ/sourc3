import {Blob, Clone, Commit, FetchOptions, Oid, Reference, Repository, Tree, TreeEntry} from 'nodegit';

const fs = require('fs')

export enum Action {
  Cloned,
  Opened
}

export class GitHandler {
  private readonly url: string;

  private readonly local_path: string;

  private repo: Repository;

  public constructor(url: string, local_path: string,
                     opened_or_created_callback: (repo: Repository, action: Action) => void) {
    this.url = url;
    this.local_path = local_path;

    if (fs.existsSync(this.local_path)) {
      Repository.open(local_path).then((repo) => {
        this.repo = repo;
        opened_or_created_callback(repo, Action.Opened);
      });
    } else {
      Clone.clone(url, local_path).then((repo) => {
        this.repo = repo;
        opened_or_created_callback(repo, Action.Cloned);
      });
    }
  }

  public async getBranches(): Promise<Array<Reference>> {
    return await this.repo.getReferences();
  }

  public async getCommits(branch: string): Promise<Array<Commit>> {
    let head_branch_commit = await this.repo.getBranchCommit(branch)
    let working_queue: Array<Oid> = [head_branch_commit.id()];

    let commit_oids = new Set<string>();
    let commits: Array<Commit> = []
    while (working_queue.length > 0) {
      let working_commit = await Commit.lookup(this.repo, working_queue.pop());
      let working_oid = working_commit.id().tostrS();
      if (commit_oids.has(working_oid)) {
        continue;
      }

      commit_oids.add(working_oid);
      commits.push(working_commit);
      for (let parent in working_commit.parents()) {
        working_queue.push(Oid.fromString(parent))
      }
    }

    return commits;
  }

  public async getTreeEntries(treeOid: string | Oid): Promise<Array<TreeEntry>> {
    let tree = await Tree.lookup(this.repo, treeOid);
    return tree.entries();
  }

  public async getBlobByOid(oid: string | Oid): Promise<Blob> {
    return await Blob.lookup(this.repo, oid);
  }

  public async fetch(remote: string, fetchOptions: FetchOptions): Promise<void> {
    return await this.repo.fetch(remote, fetchOptions);
  }
}
