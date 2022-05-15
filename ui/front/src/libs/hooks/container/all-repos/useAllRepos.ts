import { useObjectState } from '@libs/hooks/shared';
import { useSearch } from '@libs/hooks/shared/useSearch';
import { RepoListType, RepoType } from '@types';
import { ChangeEvent, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';

type LocationState = {
  page: string,
  type: RepoListType
};

type useAllRepoProps = {
  pkey:string,
  repos: RepoType[],
  searchText: string,
  setPrevHref: (href: string) => void,
  createRepos: (repo_name:string) => void,
};

const initialState = {
  isLoading: true,
  isModalVisible: false,
  inputRepoName: ''
};

const useAllRepos = ({
  pkey, repos, searchText, setPrevHref, createRepos
}:useAllRepoProps) => {
  const [state, setState] = useObjectState<typeof initialState>(initialState);
  const { pathname } = useLocation();
  const { type, page } = useParams<'type' & 'page'>() as LocationState;
  const path = pathname.split('repos/')[0];

  const { isModalVisible, inputRepoName } = state;

  const byRouteRepos = pkey && type === 'my'
    ? repos.filter(({ repo_owner }) => repo_owner === pkey)
    : repos;

  const elements = useSearch(searchText, byRouteRepos, ['repo_name', 'repo_owner'], type);

  useEffect(() => {
    setPrevHref(pathname);
  }, [page]);

  const showModal = () => {
    setState({ isModalVisible: true });
  };

  const handleOk = () => {
    setState({ isModalVisible: false });
    createRepos(inputRepoName);
  };

  const handleCancel = () => {
    setState({ isModalVisible: false });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setState({ inputRepoName: e.target.value });
  };

  const repoListProps = {
    page: +page, type, items: elements, path
  };

  return {
    state,
    repoListProps,
    isModalVisible,
    inputRepoName,
    showModal,
    handleOk,
    handleCancel,
    handleChange
  };
};

export default useAllRepos;
