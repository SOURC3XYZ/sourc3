import { useErrorBoundary } from '@components/context';
import { RepoReqType } from '@libs/action-creators';
import { getTree } from '@libs/utils';
import {
  UpdateProps,
  DataNode,
  ErrorHandler,
  MetaHash,
  IDataNodeCustom,
  UpdateOmitProps
} from '@types';
import { useEffect, useState } from 'react';

export type FileTextProps = {
  repoParams: RepoReqType;
  tree: DataNode[] | null;
  params: string[];
  pathname: string;
  filesMap: Map<MetaHash, string>,
  getFileData: (repoParams: RepoReqType, oid: string, errHandler: ErrorHandler) => void;
  updateTree: (props: UpdateOmitProps, errHandler: ErrorHandler) => void
};

export const useFileText = ({
  repoParams, tree, params, filesMap, getFileData, updateTree
}: FileTextProps) => {
  const setError = useErrorBoundary();
  const [ext, setExt] = useState('');
  const [text, setText] = useState<string | null>(null);

  const updateTreeDecor = (props: Omit<UpdateProps, 'params'>) => {
    updateTree({ ...props }, setError);
  };

  const fileChecker = () => {
    // if (text !== null) setText(null);
    const paramsCopy = [...params];
    const fileName = paramsCopy.pop();
    const currentFileList = tree && getTree(tree, paramsCopy, updateTreeDecor);
    if (currentFileList) {
      const file = currentFileList.find(
        (el) => el.title === fileName
      ) as IDataNodeCustom | undefined;
      if (file) {
        const memoized = filesMap.get(file.dataRef.oid);
        if (memoized) setText(memoized);
        else {
          getFileData(repoParams, file.dataRef.oid, setError);
        }
      } else throw new Error('no file');
    }
    if (fileName) {
      setExt(fileName.slice(fileName.lastIndexOf('.') + 1));
    }
  };

  useEffect(fileChecker, [filesMap]);

  const isLoaded = text !== null;

  return {
    ext,
    text,
    isLoaded
  };
};
