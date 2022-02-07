import {
  getBlobData,
  getBranches, getCommits, getTree, mountRepo
} from './git.repository';

const errorResCreator = (error:unknown) => {
  const { message } = error as Error;
  return { isOk: false, message } as const;
};

export const mountService = async (remote: string, local:string) => {
  try {
    const { opened, config } = await mountRepo(remote, local);
    const message = opened ? 'opened' : 'cloned';
    return {
      isOk: true,
      message: `repo successfuly ${message}`,
      config
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
