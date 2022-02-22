import { getRepository } from 'typeorm';
import { Repo, Seed } from '../../entities';
import { isExistsSync } from '../../utils';
import { GitHandler } from '../../utils/libgit';

let currentRepo: GitHandler;

export const getAllSeeds = () => getRepository(Seed)
  .find({ relations: ['repos'] });

export const mountRepo = async (
  remote:string,
  local:string,
  seedId: string
) => {
  const name = remote.slice(remote.lastIndexOf('/') + 1);
  const repoRepository = await getRepository(Repo);
  const seed = await getRepository(Seed).findOne({ where: { id: seedId } });
  const isAlreadyExists = await repoRepository.findOne({ where: { local } });

  if (isAlreadyExists) {
    if (isExistsSync(local, '.git')) {
      throw new Error('local folder is already occupied');
    } await repoRepository.remove(isAlreadyExists);
  }

  const init = new GitHandler(remote, local);
  const { repo, action } = await init.getContents();
  const answer = {
    opened: action,
    config: await repo.getRemoteNames()
  };

  if (seed) {
    const newRepo = repoRepository.create({
      remote, local, name, seedId: seed
    });
    await repoRepository.save(newRepo);
    return { repo: newRepo, ...answer };
  } throw new Error('seed not found');
};

export const getBranches = async () => {
  if (currentRepo) {
    const branches = await currentRepo.getBranches();
    const branchesData = branches.map((branch) => currentRepo
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
  if (currentRepo) {
    const commits = await currentRepo.getCommits(branch);
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
  if (currentRepo) {
    const tree = await currentRepo.getTreeEntries(treeOid);
    return tree.map((el) => ({
      treeOid: el.oid(),
      isDir: el.isDirectory(),
      name: el.name(),
      path: el.path()
    }));
  } throw new Error('repository is not initialized');
};

export const getBlobData = async (dataOid: string) => {
  if (currentRepo) {
    const blobData = await currentRepo.getBlobByOid(dataOid);
    return blobData.content().toString('hex');
  } throw new Error('repository is not initialized');
};

export const deleteLocalRepo = async (repoId: string) => {
  const repoRepository = await getRepository(Repo);
  const repo = await repoRepository.findOne({ where: { id: repoId } });
  if (repo) return repoRepository.remove(repo);
  throw new Error('repo not found');
};
