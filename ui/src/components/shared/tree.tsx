import { onLoadData } from '@libs/utils';
import {
  RepoCommit, RepoId, UpdateProps
} from '@types';
import { Tree } from 'antd';
import { DataNode } from 'antd/lib/tree';
import React from 'react';

type TreeListProps = {
  repoId: RepoId;
  commitData: RepoCommit;
  tree: DataNode[]
  getTree: (props: UpdateProps) => void;
};

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
      treeData={tree}
    />
  );
};

export default TreeList;
