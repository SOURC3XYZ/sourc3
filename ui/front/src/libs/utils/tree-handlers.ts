import {
  BranchCommit,
  BranchName,
  DataNode,
  IDataNodeCustom, RepoId, UpdateProps
} from '@types';

export const onLoadData = (
  id:RepoId, callback: (args: UpdateProps) => void
) => (props: DataNode) => new Promise<void>((resolve) => {
  const { children, key, dataRef } = props as IDataNodeCustom;
  if (children) {
    resolve();
    return;
  }
  callback({
    id, key, resolve, oid: dataRef.oid
  });
});

export const getTree = (
  treeNode:DataNode[],
  pathArray: string[],
  updateTree: (props: Omit<UpdateProps, 'id'>) => void,
  index = 0
): DataNode[] | null => {
  if (!pathArray.length) {
    return treeNode;
  }

  const currentFile = treeNode
    .find(
      (el) => el.title === pathArray[index]
    ) as IDataNodeCustom | undefined;

  if (currentFile) {
    if (currentFile.children) {
      if (index === pathArray.length - 1) return currentFile.children;
      return getTree(
        currentFile.children,
        pathArray,
        updateTree,
        index + 1
      );
    } updateTree({
      oid: currentFile.dataRef.oid,
      key: currentFile.key
    });
  } else {
    throw Error('no folder');
  }

  return null;
};

export const setBranchAndCommit = (
  repoMap:Map<BranchName, BranchCommit[]>, branch:string, commit:string
) => {
  const findedBranch = repoMap.get(branch);
  if (!findedBranch) throw Error(`branch ${branch} doesn't exist in this repo`);
  const findedCommit = findedBranch
    .find((el) => el.commit_oid === commit);
  return {
    branch,
    commit: findedCommit || findedBranch[findedBranch.length - 1]
  };
};
