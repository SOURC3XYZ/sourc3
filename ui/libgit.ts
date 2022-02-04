const { Repository, Clone, Commit, Blob, Tree, TreeEntry, FetchOptions } = require('nodegit');
const fs = require('fs')

type CommitType = typeof Commit;
type BlobType = typeof Blob;
type RepoType = typeof Repository;
type TreeType = typeof Tree;
type TreeEntryType = typeof TreeEntry;
type FetchOptionsType = typeof FetchOptions;

export enum Action {
  Cloned,
  Opened
}

export class GitHandler {
  private readonly url: string;

  private readonly local_path: string;

  private repo: RepoType;

  public constructor(url: string, local_path: string,
                     opened_or_created_callback: (repo: RepoType, action: Action) => void) {
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

  public getBranches(): Promise<Array<string>> {
    return this.repo.getReferences();
  }

  public getCommits(branch: string): Promise<Array<CommitType>> {
    let repo = this.repo;
    return new Promise<Array<CommitType>>(function(resolve, reject) {
      repo.getBranchCommit(branch).then(function(commit: CommitType) {
        let commit_list: Array<CommitType> = []
        let working_deque: Array<CommitType> = [commit]
        while (working_deque.length > 0) {
          let working_commit = working_deque.pop();
          commit_list.push(working_commit);
          for (let parent in working_commit.parents()) {
            working_deque.push(parent);
          }
        }
        resolve(commit_list);
      });
    });
  }

  public getTreeEntries(treeOid: string): Promise<Array<TreeEntryType>> {
    let repo = this.repo;
    return new Promise<Array<TreeEntryType>>(function(resolve, reject) {
      Tree.lookup(repo, treeOid, () => {
      }).then(function (tree: TreeType) {
        resolve(tree.entries())
      });
    });
  }

  public getBlobByOid(oid: string): Promise<BlobType> {
    return Blob.lookup(this.repo, oid);
  }

  public fetch(remote: string, fetchOptions: FetchOptionsType): Promise<void> {
    return this.repo.fetch(remote, fetchOptions);
  }
}
