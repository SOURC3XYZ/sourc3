import { useErrorBoundary } from '@components/context';
import { useCallApi } from '@libs/hooks/shared';
import { useRepoAction } from '@libs/hooks/thunk';
import { useSelector } from '@libs/redux';
import { loadingData } from '@libs/utils';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

type LocationState = {
  repoParams:string;
};

const useUserRepos = () => {
  const {
    params, branches, commitsMap, filesMap, tree, prevReposHref, repoMetas
  } = useSelector(({ repo }) => repo);

  const [callApi, isLoading, callApiErr] = useCallApi();

  const setError = useErrorBoundary();

  const {
    getRepo, updateTree, getFileData, killTree, clearRepo
  } = useRepoAction();

  const location = useParams<'repoParams'>() as LocationState;
  const { repoParams } = location;
  const [organization_name, project_name, repo_name] = repoParams.split('&');

  const update = useCallback(updateTree(
    { organization_name, project_name, repo_name },
    setError
  ), []);
  const [isLoaded, setIsLoaded] = useState(params?.repo_name === repo_name);

  const loadingHandler = useCallback(() => {
    loadingData(getRepo({ organization_name, project_name, repo_name }, setError))
      .then(() => setIsLoaded(true))
      .catch((err) => setError(err));
  }, []);

  useEffect(() => () => {
    const cancelCommitPendingEvent = new Event('stop-commit-pending');
    window.dispatchEvent(cancelCommitPendingEvent);
    clearRepo();
  }, []);

  const startLoading = useCallback(() => setIsLoaded(false), []);

  return {
    params: { organization_name, project_name, repo_name },
    branches,
    isLoaded,
    filesMap,
    tree,
    prevReposHref,
    repoMetas,
    commitsMap,
    callApiErr,
    callApi,
    isLoading,
    setIsLoaded,
    updateTree: update,
    startLoading,
    killTree,
    loadingHandler,
    getFileData
  };
};

export default useUserRepos;
