import { useAsyncError } from '@libs/hooks/shared';
import { useRepoAction } from '@libs/hooks/thunk';
import { useSelector } from '@libs/redux';
import { loadingData } from '@libs/utils';
import { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';

type LocationState = {
  repoParams:string;
};

const useUserRepos = () => {
  const {
    id: currentId, repoMap, filesMap, tree, prevReposHref, repoMetas
  } = useSelector(({ repo }) => repo);

  const setError = useAsyncError();
  const {
    getRepo, updateTree, getFileData, killTree
  } = useRepoAction();
  const location = useParams<'repoParams'>() as LocationState;
  const { repoParams } = location;
  const [id, repoName] = repoParams.split('&');
  const numId = Number(id);

  const update = useCallback(updateTree(numId, setError), []);
  const [isLoaded, setIsLoaded] = useState(currentId === numId);

  const loadingHandler = useCallback(() => {
    loadingData(getRepo(numId, setError))
      .then(() => setIsLoaded(true))
      .catch((err) => setError(err));
  }, []);

  return {
    id: numId,
    isLoaded,
    repoName,
    repoMap: repoMap as NonNullable<typeof repoMap>,
    filesMap,
    tree,
    prevReposHref,
    repoMetas,
    updateTree: update,
    killTree,
    loadingHandler,
    getFileData
  };
};

export default useUserRepos;
