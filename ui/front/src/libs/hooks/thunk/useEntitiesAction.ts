import { useSourc3Web } from '@components/context';
import { AC } from '@libs/action-creators';
import { entitiesThunk } from '@libs/action-creators/async';
import { useDispatch } from '@libs/redux';
import { RepoListType, ArgumentTypes } from '@types';

const useUserAsync = () => {
  const dispatch = useDispatch();
  const api = useSourc3Web();
  const [queries, mutations] = entitiesThunk(api.callApi);

  const setInputText = (str: string) => dispatch(AC.setSearch(str));

  const setPrevHref = (str: string) => dispatch(AC.setPreviousReposPage(str));

  const getOrganizations = () => dispatch(queries.getOrganizations());

  const getProjects = () => dispatch(queries.getProjects());

  const getRepos = (type: RepoListType) => dispatch(queries.getRepos(type));

  const deleteRepo = (
    ...args: ArgumentTypes<typeof mutations.deleteRepo>
  ) => dispatch(mutations.deleteRepo(...args));

  const createOrganization = (
    ...args: ArgumentTypes<typeof mutations.createOrganization>
  ) => dispatch(mutations.createOrganization(...args));

  const createProject = (
    ...args: ArgumentTypes<typeof mutations.createProject>
  ) => dispatch(mutations.createProject(...args));

  const createRepo = (
    ...args: ArgumentTypes<typeof mutations.createRepo>
  ) => dispatch(mutations.createRepo(...args));

  return {
    setInputText,
    setPrevHref,
    getOrganizations,
    getProjects,
    getRepos,
    createOrganization,
    createProject,
    createRepo,
    deleteRepo
  };
};

export default useUserAsync;