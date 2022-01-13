import { FileTextTwoTone, FolderTwoTone } from '@ant-design/icons';
import { getTree } from '@libs/utils';
import {
  DataNode, RepoId, UpdateProps
} from '@types';
import { Link, useLocation } from 'react-router-dom';
import { Preload } from '../preload';

type FileTreeBlockProps = {
  id: RepoId;
  tree: DataNode[] | null;
  updateTree: (props: UpdateProps) => void;
};

const leafCreator = (url:string, node: DataNode, path: string[]) => {
  if (node.isLeaf) {
    return (
      <div>
        <FileTextTwoTone twoToneColor="#0044ff" />
        <Link to={`/repo/${path
          .slice(0, 1).join('/')}/blob/${path
          .slice(2).join('/')}/${node.title}`}
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

const FileTreeBlock = ({ id, tree, updateTree }:FileTreeBlockProps) => {
  const { pathname } = useLocation();

  const updateTreeDecor = (props: Omit<UpdateProps, 'id'>) => {
    updateTree({ ...props, id });
  };

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
