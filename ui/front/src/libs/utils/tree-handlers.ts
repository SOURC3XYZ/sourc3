import { FileCodes } from '@libs/constants';
import {
  DataNode,
  IDataNodeCustom, RepoId, TreeElement, UpdateProps
} from '@types';

export const extCheck = (attr:number):boolean => attr === FileCodes.LEAF;

export const fileSorter = (a:TreeElement, b:TreeElement) => {
  const aLow = a.filename.toLocaleLowerCase();
  const bLow = b.filename.toLocaleLowerCase();
  const aExt = extCheck(a.attributes);
  const bExt = extCheck(b.attributes);
  if (aExt < bExt || aLow < bLow) { return -1; }
  if (aExt > bExt || aLow > bLow) { return 1; }
  return 0;
};

export const treeDataMaker = (
  tree: TreeElement[] = [], parentKey?: React.Key
):IDataNodeCustom[] => {
  const newTree = tree.sort(fileSorter).map((el, i) => ({
    title: el.filename,
    key: parentKey !== undefined ? `${parentKey}-${i}` : i,
    isLeaf: extCheck(el.attributes),
    dataRef: el
  }));
  return newTree;
};

export const updateTreeData = (
  list: DataNode[] | null, children: DataNode[], key?: React.Key
): DataNode[] | null => {
  if (key === undefined) return children;
  if (!list) return null;
  const newList = list.map((node) => {
    if (node.key === key) {
      return {
        ...node,
        children
      };
    }
    if (node.children) {
      return {
        ...node,
        children: updateTreeData(node.children, children, key)
      };
    }
    return node;
  });
  return newList as DataNode[];
};

export const onLoadData = (
  id:RepoId, callback: (args: UpdateProps) => void
) => (
  props: DataNode
) => new Promise<void>((resolve) => {
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
  pathname: string,
  updateTree: (props: Omit<UpdateProps, 'id'>) => void,
  index = 0
): DataNode[] | null => {
  const pathArray = pathname.split('/')
    .slice(6);

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
        pathname,
        updateTree,
        index + 1
      );
    } updateTree({
      oid: currentFile.dataRef.oid,
      key: currentFile.key
    });
  } return null;
};
