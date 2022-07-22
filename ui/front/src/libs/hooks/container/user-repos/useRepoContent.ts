import { useAsyncError, useCallApi } from '@libs/hooks/shared';
import { useSelector } from '@libs/redux';

import {
  Branch,
  BranchCommit,
  DataNode,
  ErrorHandler,
  UpdateProps
} from '@types';
import {
  useCallback, useEffect, useMemo, useState
} from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { getCommit, splitUrl } from './helpers';

type LocationState = {
  branchName: string;
  type: 'tree' | 'blob'
};

const useRepoContent = (
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
  const { branchName, type } = useParams<'branchName' | 'type'>() as LocationState;

  const branchParsed = useMemo(() => branchName.replaceAll('-', '/'), [branchName]);

  const { baseUrl, params } = useMemo(
    () => splitUrl(`${type}/${branchName}`, pathname),
    [pathname]
  );

  const fetchCommit = async (name: string) => {
    setCommit(null);
    if (tree) killTree();
    const regex = new RegExp(`(${name})`);
    const [first] = branches;
    const findedBranch = branches.find((el) => el.name.match(regex)) || first;

    if (!findedBranch) return setError(new Error('no branch'));
    const lastCommit = await getCommit(id, findedBranch.commit_hash, callApi, callIpfs);
    if (lastCommit) {
      setCommit(lastCommit);
      return updateTree({ oid: lastCommit.tree_oid }, setError);
    } return setError(new Error('no commit'));
  };

  const goToBranch = useCallback(
    (newBranch: string) => {
      fetchCommit(newBranch);
      goTo(`branch/${type}/${newBranch.replaceAll('/', '-')}/${params.join('/')}`);
    },
    [params]
  );

  useEffect(() => {
    if (!branches.length) setError(new Error('repo is empty'));
    else fetchCommit(branchName);
  }, []);

  const goToCommitTree = useCallback((branch: string) => {
    console.log('BRANCH', branch);
    goTo(`commits/${branch.replaceAll('/', '-')}`);
  }, []);

  const isLoading = loading || !commit;

  useEffect(() => {
    if (tree) killTree();
    if (commit) updateTree({ oid: commit.tree_oid }, setError);
  }, [params]);

  return {
    branchName: branchParsed,
    baseUrl,
    params,
    commit,
    type,
    isLoading,
    err,
    pathname,
    commitsMap,
    setError,
    goToBranch,
    goToCommitTree
  };
};

export default useRepoContent;
