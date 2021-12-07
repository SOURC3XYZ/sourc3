import {
  IDataNodeCustom, RepoId, TreeElement, UpdateProps
} from '@types';
import { DataNode } from 'antd/lib/tree';

export const treeDataMaker = (
  tree: TreeElement[], parentKey?: React.Key
):IDataNodeCustom[] => {
  const newTree = tree.map((el, i) => ({
    title: el.filename,
    key: parentKey ? `${parentKey}-${i}` : i,
    isLeaf: el.filename.split('.').length > 1,
    dataRef: el
  }));
  return newTree;
};

export const updateTreeData = (
  list: DataNode[], children: DataNode[], key?: React.Key
): DataNode[] => {
  if (!key) return children;
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
