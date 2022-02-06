import { Config, Repository } from 'nodegit';
import { Action, GitHandler } from '../../utils/libgit';

let repo: GitHandler;

type MountAnswer = {
  opened: Action
  config: Config
};

export const mountRepo = (remote:string, local:string) => new Promise(
  (resolve:(config:MountAnswer) => void) => {
    repo = new GitHandler(
      remote,
      local,
      async (incomingRepo: Repository, action: Action) => {
        const answer = {
          opened: action,
          config: await incomingRepo.config()
        };
        resolve(answer);
      }
    );
  }
);

export const getBranches = async () => {
  if (repo) {
    const branches = await repo.getBranches();
    const branchesData = branches.map((branch) => repo
      .getRecentCommit(branch)
      .then((recentCommit) => ({
        name: branch.name(),
        isHead: branch.isHead(),
        isConcrete: branch.isConcrete(),
        recentCommit
      })));
    const promises = await Promise.all(branchesData);
    return promises;
  } throw new Error('repository is not initialized');
};

export const getCommits = async (branch: string) => {
  if (repo) {
    const commits = await repo.getCommits(branch);
    return commits.map((el) => ({
      author: el.author().toString(),
      authorEmail: el.author().email(),
      date: el.date(),
      commitId: el.id().tostrS(),
      treeId: el.treeId().tostrS(),
      message: el.message()
    }));
  } throw new Error('repository is not initialized');
};

export const getTree = async (treeOid: string) => {
  if (repo) {
    const tree = await repo.getTreeEntries(treeOid);
    return tree.map((el) => ({
      treeOid: el.oid(),
      isDir: el.isDirectory(),
      name: el.name(),
      path: el.path()
    }));
  } throw new Error('repository is not initialized');
};

export const getBlobData = async (dataOid: string) => {
  if (repo) {
    const blobData = await repo.getBlobByOid(dataOid);
    return blobData.content().toString('hex');
  } throw new Error('repository is not initialized');
};
