import { onLoadData } from '@libs/utils';
import {
  IDataNodeCustom,
  RepoCommit, RepoId, UpdateProps
} from '@types';
import { Tree } from 'antd';
import { DataNode } from 'antd/lib/tree';
import React from 'react';
import { Link } from 'react-router-dom';

type TreeListProps = {
  repoId: RepoId;
  commitData: RepoCommit;
  tree: DataNode[]
  getTree: (props: UpdateProps) => void;
};

const treeLinkNodeUpdate = (id: RepoId) => (branch:DataNode[]) => branch
  .map((el) => {
    const { dataRef } = el as IDataNodeCustom;
    const newEl = { ...el };
    if (newEl.isLeaf) {
      newEl.title = <Link to={`/data/${id}/${dataRef.oid}`}>{el.title}</Link>;
    }
    if (newEl.children) newEl.children = treeLinkNodeUpdate(id)(newEl.children);
    return { ...newEl, dataRef };
  });

const TreeList = ({
  repoId, commitData, tree, getTree
}:TreeListProps) => {
  const { tree_oid } = commitData;

  React.useEffect(() => {
    getTree({
      id: repoId,
      oid: tree_oid
    });
  }, []);

  return (
    <Tree.DirectoryTree
      multiple
      defaultExpandAll
      loadData={onLoadData(repoId, getTree)}
      treeData={treeLinkNodeUpdate(repoId)(tree)}
    />
  );
};

export default TreeList;
