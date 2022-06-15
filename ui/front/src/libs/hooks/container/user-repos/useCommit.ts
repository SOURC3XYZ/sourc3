import { useAsyncError, useCallApi } from '@libs/hooks/shared';
import { useSelector } from '@libs/redux';
import { clipString } from '@libs/utils';
import {
  Branch,
  BranchCommit, DataNode, ErrorHandler, UpdateProps
} from '@types';
import {
  useCallback, useEffect, useMemo, useState
} from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { getCommit, splitUrl } from './helpers';

type LocationState = {
  hash: string;
  type: string;
};

export const useCommit = (
  id: number,
  branches: Branch[],
  tree: DataNode[] | null,
  goTo: (path: string) => void,
  updateTree: (props: Omit<UpdateProps, 'id'>, errorHandler: ErrorHandler) => void,
  killTree: () => void
) => {
  const commitsMap = useSelector((state) => state.repo.commitsMap);
  const [commit, setCommit] = useState<BranchCommit | null>(null);
  const setError = useAsyncError();
  const [callApi, callIpfs, loading, err] = useCallApi();
  const { pathname } = useLocation();
  const { hash, type } = useParams<'hash' | 'type'>() as LocationState;

  const { baseUrl, params } = useMemo(
    () => splitUrl(`${hash}`, pathname),
    [pathname]
  );

  const fetchCommit = async () => {
    setCommit(null);
    const lastCommit = await getCommit(id, hash, callApi, callIpfs);
    if (lastCommit) {
      setCommit(lastCommit);
      return updateTree({ oid: lastCommit.tree_oid }, setError);
    } return setError(new Error('no commit'));
  };

  useEffect(() => { fetchCommit(); }, []);

  const goToCommitTree = useCallback((e: any) => {
    e.preventDefault();
    const [first] = branches;
    const branch = branches.find((el) => el.name.match(/(main|master)/)) || first;
    goTo(`commits/${clipString(branch.name)}`);
  }, []);

  const isLoading = loading || !commit;

  useEffect(() => {
    if (tree) killTree();
    if (commit) updateTree({ oid: commit.tree_oid }, setError);
  }, [params]);

  return {
    baseUrl,
    params,
    commit,
    isLoading,
    err,
    type,
    pathname,
    commitsMap,
    setError,
    goToCommitTree
  };
};
