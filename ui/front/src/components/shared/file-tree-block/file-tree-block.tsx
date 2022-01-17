import { FileTextTwoTone, FolderTwoTone } from '@ant-design/icons';
import { getTree } from '@libs/utils';
import {
  DataNode, RepoId, UpdateProps
} from '@types';
import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Preload } from '../preload';

type ParamsProps = {
  branch: string;
  commit: string;
};

type FileTreeBlockProps = {
  id: RepoId;
  tree: DataNode[] | null;
  updateTree: (props: UpdateProps) => void;
  checkBranch: (branch: string, commit: string) => void;
};

const leafCreator = (url:string, node: DataNode, path: string[]) => {
  if (node.isLeaf) {
    return (
      <div>
        <FileTextTwoTone twoToneColor="#0044ff" />
        <Link to={`/repo/${path
          .slice(0, 1).join('/')}/blob/${path
          .slice(2).join('/')}/${node.title}`}
          // TODO: DANIK: make more readable
        >
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
  id, tree, updateTree, checkBranch
}:FileTreeBlockProps) => {
  const { pathname } = useLocation();
  const { branch, commit } = useParams<'branch'>() as ParamsProps;
  const updateTreeDecor = (props: Omit<UpdateProps, 'id'>) => {
    updateTree({ ...props, id });
  };

  React.useEffect(() => checkBranch(branch, commit), []);

  const treeList = tree && getTree(
    tree, pathname, updateTreeDecor
  )?.map((el) => leafCreator(pathname, el, pathname.split('/').slice(2)));

  return (
    <>
      {treeList || <Preload />}
    </>
  );
};

export default FileTreeBlock;
