import { loadingData } from '@libs/utils';
import { RepoId, UpdateProps } from '@types';
import { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import useAsyncError from './useAsyncError';

type LocationState = {
  repoParams:string;
};

type useUserReposProps = {
  currentId: RepoId | null;
  getRepoData: (
    id: RepoId, errHandler: (e: Error) => void
  ) => (resolve: () => void) => void;
  updateTree: (
    id: RepoId, errHandler: (e: Error) =>void
  ) => (props: Omit<UpdateProps, 'id'>) => void;
};

const useUserRepos = ({
  currentId, getRepoData, updateTree
}:useUserReposProps) => {
  const setError = useAsyncError();
  const location = useParams<'repoParams'>() as LocationState;
  const { repoParams } = location;
  const [id, repoName] = repoParams.split('&');
  const numId = Number(id);

  const update = useCallback(updateTree(numId, setError), []);
  const [isLoaded, setIsLoaded] = useState(currentId === numId);

  const loadingHandler = useCallback(() => {
    loadingData(getRepoData(numId, setError))
      .then(() => setIsLoaded(true))
      .catch((err) => setError(err));
  }, []);

  return {
    id: numId,
    isLoaded,
    repoName,
    updateTree: update,
    loadingHandler
  };
};

export default useUserRepos;
