import {
  DataNode,
  IDataNodeCustom, RepoId, TreeElement, UpdateProps
} from '@types';

export const extCheck = (fileName:string):string | undefined => {
  const re = /(?:\.([^.]+))?$/;
  const compare = re.exec(fileName);
  const condition = compare && compare?.length > 1 && fileName !== '.vscode';
  if (condition) return compare[1];
  return undefined;
};

export const fileSorter = (a:TreeElement, b:TreeElement) => {
  const aLow = a.filename.toLocaleLowerCase();
  const bLow = b.filename.toLocaleLowerCase();
  const aExt = !!extCheck(a.filename);
  const bExt = !!extCheck(b.filename);
  if (+aExt < +bExt || aLow < bLow) { return -1; }
  if (aExt > bExt || aLow > bLow) { return 1; }
  return 0;
};

export const treeDataMaker = (
  tree: TreeElement[] = [], parentKey?: React.Key
):IDataNodeCustom[] => {
  const newTree = tree.sort(fileSorter).map((el, i) => ({
    title: el.filename,
    key: parentKey !== undefined ? `${parentKey}-${i}` : i,
    isLeaf: !!extCheck(el.filename),
    dataRef: el
  }));
  return newTree;
};

export const updateTreeData = (
  list: DataNode[], children: DataNode[], key?: React.Key
): DataNode[] => {
  if (key === undefined) return children;
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
  return newList;
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
