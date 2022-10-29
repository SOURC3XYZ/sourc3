import { Preload } from '@components/shared';
import { getTree } from '@libs/utils';
import {
  DataNode, ErrorHandler, IDataNodeCustom, UpdateProps
} from '@types';
import { List } from 'antd';
import { useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import fileImg from '@assets/img/file.svg';
import folderImg from '@assets/img/folder.svg';
import { useDownloadBlob } from '@libs/hooks/shared';
import { PreloadComponent } from '@components/hoc';
import { LoadingMessages } from '@libs/constants';
import { CloudDownloadOutlined, FileZipOutlined, SyncOutlined } from '@ant-design/icons';
import { useErrorBoundary } from '@components/context';
import { RepoReqType } from '@libs/action-creators';
import styles from './file-tree-block.module.scss';

type FileTreeBlockProps = {
  params: RepoReqType
  tree: DataNode[] | null;
  pathname:string;
  pathArray: string[];
  // time: number;
  updateTree: (props: UpdateProps, errHandler: ErrorHandler) => void;
};

type LeafCreatorProps = {
  params: RepoReqType,
  url: string;
  node: IDataNodeCustom;
};

function LeafCreator({ params, url, node }:LeafCreatorProps) {
  // const date = `${dateCreator(time * 1000)}`;

  const { dataRef } = node;

  const [isOnDownload, downloadResource] = useDownloadBlob(
    { params: { ...params, obj_id: dataRef.oid }, name: dataRef.filename }
  );

  const downloadButton = useMemo(
    () => (!isOnDownload
      ? (
        <Link
          onClick={downloadResource}
          download={dataRef.filename}
          to="#"
        >
          <CloudDownloadOutlined className={styles.cloudButton} />
        </Link>
      )
      : <SyncOutlined className={styles.cloudButton} spin />),
    [isOnDownload]
  );

  if (node.isLeaf) {
    const blobUrl = url.replace('tree', 'blob');

    const isArchive = useMemo(() => {
      const { length, [length - 1]: last } = node.dataRef.filename.split('.');

      return (last && (/(zip|tar|rar)/i.test(last)));
    }, []);

    const link = useMemo(() => (isArchive
      ? <span className={styles.archiveFile}>{node.title}</span>
      : <Link to={`${blobUrl}/${node.title}`}>{node.title}</Link>), [isArchive]);

    const image = useMemo(() => (isArchive
      ? <FileZipOutlined className={[styles.archiveIcon, styles.fileIconImg].join(' ')} />
      : <img className={styles.fileIconImg} alt="leaf" src={fileImg} />), [isArchive]);

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
              {image}
              {link}
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
            <img className={styles.fileIconImg} alt="folder" src={folderImg} />
            <Link to={`${url}/${node.title}`}>{node.title}</Link>
          </div>
        )}
      />
    </List.Item>
  );
}

function FileTreeBlock({
  params, tree, pathname, pathArray, updateTree
}:FileTreeBlockProps) {
  const setError = useErrorBoundary();

  const updateTreeDecor = (
    props: Omit<UpdateProps, 'id'>
  ) => updateTree({ ...props }, setError);

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
        renderItem={
          (item) => <LeafCreator params={params} url={pathname} node={item as IDataNodeCustom} />
        }
      />
    </PreloadComponent>
  );
}

export default FileTreeBlock;
