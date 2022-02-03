import { FileTextTwoTone, FolderTwoTone } from '@ant-design/icons';
import { getTree } from '@libs/utils';
import {
  DataNode, RepoId, UpdateProps
} from '@types';
import React from 'react';
import { Link } from 'react-router-dom';
import { Preload } from '../../../../../../../../shared/preload';

type FileTreeBlockProps = {
  id: RepoId;
  tree: DataNode[] | null;
  pathname:string;
  updateTree: (props: UpdateProps) => void;
};

const leafCreator = (url:string, node: DataNode) => {
  if (node.isLeaf) {
    const blobUrl = url.replace('tree', 'blob');
    return (
      <div>
        <FileTextTwoTone twoToneColor="#0044ff" />
        <Link to={`${blobUrl}/${node.title}`}>
          {node.title}

        </Link>
      </div>
    );
  } return (
    <div>
      <FolderTwoTone twoToneColor="#ffb700" />
      <Link to={`${url}/${node.title}`}>{node.title}</Link>
    </div>
  );
};

const FileTreeBlock = ({
  id, tree, pathname, updateTree
}:FileTreeBlockProps) => {
  const updateTreeDecor = (props: Omit<UpdateProps, 'id'>) => {
    updateTree({ ...props, id });
  };

  const treeList = tree && getTree(
    tree, pathname, updateTreeDecor
  )?.map((el) => leafCreator(pathname, el));

  return (
    <>
      {treeList || <Preload />}
    </>
  );
};

export default React.memo(FileTreeBlock);
