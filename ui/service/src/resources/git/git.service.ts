import {
  deleteLocalRepo,
  getAllSeeds,
  getBlobData,
  getBranches, getCommits, getCurrent, getTree, mountRepo
} from './git.repository';

const errorResCreator = (error:unknown) => {
  const { message } = error as Error;
  return { isOk: false, message } as const;
};

export const getAllSeedsService = async () => getAllSeeds();

export const mountService = async (
  remote: string,
  local:string,
  seedId:string
) => {
  try {
    const answer = await mountRepo(remote, local, seedId);
    const message = answer.opened ? 'opened' : 'cloned';
    return {
      isOk: true,
      message: `repo successfuly ${message}`,
      ...answer
    } as const;
  } catch (error) { return errorResCreator(error); }
};

export const getBranchesService = async () => {
  try {
    const branches = await getBranches();
    return {
      isOk: true,
      message: 'branches successfully received',
      branches
    } as const;
  } catch (error) { return errorResCreator(error); }
};

export const getCommitsService = async (branch:string) => {
  try {
    const commits = await getCommits(branch);
    return {
      isOk: true,
      message: 'commits successfully received',
      commits
    } as const;
  } catch (error) { return errorResCreator(error); }
};

export const getTreeService = async (treeOid:string) => {
  try {
    const tree = await getTree(treeOid);
    return {
      isOk: true,
      message: 'commits successfully received',
      tree
    } as const;
  } catch (error) { return errorResCreator(error); }
};

export const getBlobDataService = async (treeOid:string) => {
  try {
    const blob = await getBlobData(treeOid);
    return {
      isOk: true,
      message: 'data successfully received',
      blob
    } as const;
  } catch (error) { return errorResCreator(error); }
};

export const deleteRepoService = async (repoId:string) => {
  try {
    const repo = await deleteLocalRepo(repoId);
    return {
      isOk: true,
      message: 'repo successfuly deleted',
      repo
    } as const;
  } catch (error) { return errorResCreator(error); }
};

export const getCurrentService = async () => {
  try {
    const current = await getCurrent();
    return { isOk: true, current } as const;
  } catch (error) { return errorResCreator(error); }
};
