import { searchFilter } from '@libs/utils';
import { RepoListType, RepoType } from '@types';
import { useEffect, useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';

type LocationState = {
  page: string,
  type: RepoListType
};

type useAllRepoProps = {
  pkey:string,
  repos: RepoType[],
  searchText: string,
  setPrevHref: (href: string) => void
};

const useAllRepos = ({
  pkey, repos, searchText, setPrevHref
}:useAllRepoProps) => {
  const { pathname } = useLocation();
  const { type, page } = useParams<'type' & 'page'>() as LocationState;
  const path = pathname.split('repos/')[0];

  const byRouteRepos = pkey && type === 'my'
    ? repos.filter(({ repo_owner }) => repo_owner === pkey)
    : repos;

  const elements = useMemo(() => searchFilter(
    searchText, byRouteRepos, ['repo_id', 'repo_name']
  ), [searchText, repos, type]);

  useEffect(() => {
    setPrevHref(pathname);
  }, [page]);

  return {
    path, type, page: +page, elements
  };
};

export default useAllRepos;
