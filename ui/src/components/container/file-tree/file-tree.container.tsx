import { AC, thunks } from '@libs/action-creators';
import { AppThunkDispatch, RootState } from '@libs/redux';
import { onLoadData } from '@libs/utils';
import {
  IDataNodeCustom,
  RepoId, TreeOid, UpdateProps
} from '@types';
import { Tree } from 'antd';
import { DataNode } from 'antd/lib/tree';
import React from 'react';
import { batch, connect } from 'react-redux';
import { Link } from 'react-router-dom';

type TreeListProps = {
  id: RepoId;
  oid: TreeOid | undefined;
  tree: DataNode[]
  updateTree: (props: UpdateProps) => void;
  killRef: () => void;
};

const treeLinkNodeUpdate = (id: RepoId) => (branch:DataNode[]) => branch
  .map((el) => {
    const { dataRef } = el as IDataNodeCustom;
    const newEl = { ...el };
    if (newEl.isLeaf) {
      newEl.title = (
        <Link
          style={{ textDecoration: 'none', color: 'black' }}
          to={`/repo/${id}/${dataRef.oid}`}
        >
          {el.title}
        </Link>
      );
    }
    if (newEl.children) newEl.children = treeLinkNodeUpdate(id)(newEl.children);
    return { ...newEl, dataRef };
  });

const FileTree = ({
  id, oid, tree, updateTree, killRef
}:TreeListProps) => {
  React.useEffect(() => () => killRef(), []);
  React.useEffect(() => {
    if (oid) {
      updateTree({
        id,
        oid
      });
    }
  }, [oid]);

  return (
    <>
      {oid
      && (
        <Tree.DirectoryTree
          multiple
          defaultExpandAll
          loadData={onLoadData(id, updateTree)}
          treeData={treeLinkNodeUpdate(id)(tree)}
        />
      )}
    </>
  );
};

const mapState = (
  { repo: { refs, commitData, tree } }:RootState,
  { id } : { id: RepoId }
) => ({
  id,
  refs,
  tree,
  oid: commitData?.tree_oid
});

const mapDispatch = (dispatch:AppThunkDispatch) => ({
  killRef: () => {
    batch(() => {
      dispatch(AC.setRepoRefs([]));
      dispatch(AC.setTreeData([]));
    });
  },
  updateTree: (props: UpdateProps) => {
    dispatch(thunks.getTree(props));
  }
});

export default connect(mapState, mapDispatch)(FileTree);
