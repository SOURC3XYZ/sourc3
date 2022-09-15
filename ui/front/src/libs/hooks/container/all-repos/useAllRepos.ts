import { useSearch } from '@libs/hooks/shared/useSearch';
import { useEntitiesAction } from '@libs/hooks/thunk';
import { useSelector } from '@libs/redux';
import { RepoListType } from '@types';
import { useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';

type LocationState = {
  page: string,
  type: RepoListType
};

const useAllRepos = (prevHref = false) => {
  const pkey = useSelector((state) => state.app.pkey);
  const { repos, searchText } = useSelector(
    ({ entities }) => ({ repos: entities.repos, searchText: entities.searchText })
  );
  const { setPrevHref, setInputText, deleteRepo } = useEntitiesAction();
  const { pathname } = useLocation();
  const { type, page } = useParams<'type' & 'page'>() as LocationState;
  const path = pathname.split('repos/')[0];

  const byRouteRepos = pkey && type === 'my'
    ? repos.filter(({ repo_owner }) => repo_owner === pkey)
    : repos;

  const elements = useSearch(searchText, byRouteRepos, ['repo_name', 'repo_owner'], type);

  useEffect(() => {
    if (prevHref) setPrevHref(pathname);
  }, [page]);

  return {
    pkey,
    page: +page,
    type,
    items: elements,
    path,
    searchText,
    setInputText,
    deleteRepo
  };
};

export default useAllRepos;
