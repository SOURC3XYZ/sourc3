import { Preload } from '@components/shared';
import { getTree } from '@libs/utils';
import {
  DataNode, ErrorHandler, IDataNodeCustom, RepoId, UpdateProps
} from '@types';
import { List } from 'antd';
import { useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import fileImg from '@assets/img/file.svg';
import folderImg from '@assets/img/folder.svg';
import { useAsyncError, useDownloadBlob } from '@libs/hooks/shared';
import { PreloadComponent } from '@components/hoc';
import { LoadingMessages } from '@libs/constants';
import { CloudDownloadOutlined, SyncOutlined } from '@ant-design/icons';
import styles from './file-tree-block.module.scss';

type FileTreeBlockProps = {
  id: RepoId;
  tree: DataNode[] | null;
  pathname:string;
  pathArray: string[];
  // time: number;
  updateTree: (props: UpdateProps, errHandler: ErrorHandler) => void;
};

type LeafCreatorProps = {
  id: number,
  url: string;
  node: IDataNodeCustom;
};

function LeafCreator({ id, url, node }:LeafCreatorProps) {
  // const date = `${dateCreator(time * 1000)}`;

  const { dataRef } = node;

  const [download, isOnLoading] = useDownloadBlob(
    { id, name: dataRef.filename, gitHash: dataRef.oid }
  );

  const handleDownload = useCallback(() => {
    if (isOnLoading) return;
    download();
  }, [isOnLoading, download]);

  // '#FF791F',
  // '#3FD05A',
  // '#000000',
  // '#C271B4',
  // '#4DA2E6',

  const downloadButton = useMemo(
    () => (!isOnLoading
      ? <CloudDownloadOutlined className={styles.cloudButton} onClick={handleDownload} />
      : <SyncOutlined className={styles.cloudButton} spin />),
    [isOnLoading]
  );

  if (node.isLeaf) {
    const blobUrl = url.replace('tree', 'blob');
    return (
      <List.Item
        className={styles.listItem}
        actions={
          [
            downloadButton
          ]
        }
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
      // actions={[(<span key="list-time" className={styles.time}>{date}</span>)]}
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
}

function FileTreeBlock({
  id, tree, pathname, pathArray, updateTree
}:FileTreeBlockProps) {
  const setError = useAsyncError();

  const updateTreeDecor = (
    props: Omit<UpdateProps, 'id'>
  ) => updateTree({ ...props, id }, setError);

  const TreeListPreloadFallback = useCallback(() => (
    <Preload
      message={LoadingMessages.TREE}
      className={styles.preload}
    />
  ), []);

  const treeList = useMemo(() => tree && getTree(
    tree,
    pathArray,
    updateTreeDecor
  ), [tree]);

  return (
    <PreloadComponent
      isLoaded={!!treeList}
      Fallback={TreeListPreloadFallback}
    >
      <List
        className={styles.tree}
        bordered
        size="small"
        dataSource={treeList || undefined}
        renderItem={(item) => <LeafCreator id={id} url={pathname} node={item as IDataNodeCustom} />}
      />
    </PreloadComponent>
  );
}

export default FileTreeBlock;
