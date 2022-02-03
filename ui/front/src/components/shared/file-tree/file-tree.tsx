import { Preload } from '@components/shared';
import { extCheck, onLoadData } from '@libs/utils';
import {
  DataNode,
  IDataNodeCustom,
  RepoId, UpdateProps
} from '@types';
import { Tree } from 'antd';
import { Link } from 'react-router-dom';
import style from './free-tree.module.css';

type TreeListProps = {
  id: RepoId;
  tree: DataNode[] | null
  updateTree: (props: UpdateProps) => void;
};

const treeLinkNodeUpdate = (id: RepoId) => (branch:DataNode[]) => branch
  .map((el) => {
    const { dataRef } = el as IDataNodeCustom;
    const newEl = { ...el };
    if (newEl.isLeaf) {
      newEl.title = (
        <Link
          className={style.leaf}
          to={`/repo/${id}/${dataRef.oid}&${extCheck(dataRef.filename)}`}
        >
          {dataRef.filename}
        </Link>
      );
    }
    if (newEl.children) newEl.children = treeLinkNodeUpdate(id)(newEl.children);
    return { ...newEl, dataRef };
  });

function FileTree({
  id, tree, updateTree
}:TreeListProps) {
  return (
    <>
      {tree
        ? (
          <div className={style.customTree}>
            <Tree.DirectoryTree
              selectable={false}
              loadData={onLoadData(id, updateTree)}
              treeData={treeLinkNodeUpdate(id)(tree)}
            />
          </div>
        )
        : <Preload />}
    </>
  );
}

export default FileTree;
