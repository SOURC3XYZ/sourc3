import { useAsyncError } from '@libs/hooks/shared';
import { getTree } from '@libs/utils';
import {
  UpdateProps,
  DataNode,
  ErrorHandler,
  MetaHash,
  RepoId,
  IDataNodeCustom
} from '@types';
import { useEffect, useState } from 'react';

export type FileTextProps = {
  id: RepoId;
  tree: DataNode[] | null;
  pathArray: string[];
  pathname: string;
  filesMap: Map<MetaHash, string>,
  getFileData: (repoId: RepoId, oid: string, errHandler: ErrorHandler) => void;
  updateTree: (props: UpdateProps, errHandler: ErrorHandler) => void
};

export const useFileText = ({
  id, tree, filesMap, pathArray, pathname, getFileData, updateTree
}: FileTextProps) => {
  const setError = useAsyncError();
  const [ext, setExt] = useState('');
  const [text, setText] = useState<string | null>(null);

  const updateTreeDecor = (props: Omit<UpdateProps, 'id'>) => {
    updateTree({ ...props, id }, setError);
  };

  const fileChecker = () => {
    if (text !== null) setText(null);
    const fileName = pathArray.pop();
    const currentFileList = tree && getTree(tree, pathArray, updateTreeDecor);
    if (currentFileList) {
      const file = currentFileList.find(
        (el) => el.title === fileName
      ) as IDataNodeCustom | undefined;
      if (file) {
        const memoized = filesMap.get(file.dataRef.oid);
        if (memoized) setText(memoized);
        else {
          getFileData(id, file.dataRef.oid, setError);
        }
      } else throw new Error('no file');
    }
    if (fileName) {
      setExt(fileName.slice(fileName.lastIndexOf('.') + 1));
    }
  };

  useEffect(fileChecker, [tree, filesMap, pathname]);

  const isLoaded = text !== null;

  return {
    ext,
    text,
    isLoaded
  };
};
