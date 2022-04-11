import { Preload } from '@components/shared';
import { getTree } from '@libs/utils';
import {
  DataNode, ErrorHandler, RepoId, UpdateProps
} from '@types';
import { List } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';
import fileImg from '@assets/img/file.svg';
import folderImg from '@assets/img/folder.svg';
import { useAsyncError } from '@libs/hooks';
import styles from './file-tree-block.module.scss';

type FileTreeBlockProps = {
  id: RepoId;
  tree: DataNode[] | null;
  pathname:string;
  pathArray: string[];
  updateTree: (props: UpdateProps, errHandler: ErrorHandler) => void;
};

const leafCreator = (url:string, node: DataNode) => {
  if (node.isLeaf) {
    const blobUrl = url.replace('tree', 'blob');
    return (
      <List.Item
        className={styles.listItem}
        actions={[(<span className={styles.time}>Updated 5 hours ago</span>)]}
      >
        <List.Item.Meta
          title={(
            <div className={styles.treeElement}>
              <img alt="leaf" src={fileImg} />
              <Link to={`${blobUrl}/${node.title}`}>{node.title}</Link>
            </div>
          )}
        />
      </List.Item>
    );
  } return (
    <List.Item
      className={styles.listItem}
      actions={[(<span className={styles.time}>Updated 5 hours ago</span>)]}
    >
      <List.Item.Meta
        title={(
          <div className={styles.treeElement}>
            <img alt="folder" src={folderImg} />
            <Link to={`${url}/${node.title}`}>{node.title}</Link>
          </div>
        )}
      />
    </List.Item>
  );
};

const FileTreeBlock = ({
  id, tree, pathname, pathArray, updateTree
}:FileTreeBlockProps) => {
  const setError = useAsyncError();

  const updateTreeDecor = (props: Omit<UpdateProps, 'id'>) => {
    updateTree({ ...props, id }, setError);
  };

  const treeList = tree && getTree(
    tree,
    pathArray,
    updateTreeDecor
  );
  return (
    <>
      {
        treeList
          ? (
            <List
              className={styles.tree}
              bordered
              size="small"
              dataSource={treeList}
              renderItem={(item) => leafCreator(pathname, item)}
            />
          ) : <Preload />
      }
    </>
  );
};

export default React.memo(FileTreeBlock);
