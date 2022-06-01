import { CustomAction } from '@libs/redux';
import {
  CallBeamApi, OrganizationsResp, ProjectsResp, RepoListType, ReposResp
} from '@types';
import { AC } from '../action-creators';
import { contractCall } from '../helpers';
import { RC } from '../request-schemas';

export const entitiesThunk = (callApi: CallBeamApi) => {
  const [contractQuery, contractMutation] = contractCall(callApi);

  const createRepo = (
    name: string,
    projectId: number,
    pid = 0
  ):CustomAction => async (dispatch) => contractMutation(
    dispatch,
    RC.createRepo(name, projectId, pid)
  );

  const deleteRepo = (
    delete_repo: number
  ):CustomAction => async (dispatch) => contractMutation(
    dispatch,
    RC.deleteRepos(delete_repo)
  );

  const createOrganization = (
    name: string,
    pid = 0
  ):CustomAction => async (dispatch) => contractMutation(
    dispatch,
    RC.createOrganization(name, pid)
  );

  const createProject = (
    name: string,
    organizationId:number,
    pid = 0
  ):CustomAction => async (dispatch) => contractMutation(
    dispatch,
    RC.createProject(name, organizationId, pid)
  );

  const getOrganizations = ():CustomAction => async (dispatch) => contractQuery(
    dispatch,
    RC.getOrganizations(),
    (output:OrganizationsResp) => dispatch(AC.setOrganizationsList(output.organizations))
  );

  const getProjects = ():CustomAction => async (dispatch) => {
    contractQuery(
      dispatch,
      RC.getProjects(),
      (output:ProjectsResp) => dispatch(AC.setProjectsList(output.projects))
    );
  };

  const getRepos = (type:RepoListType):CustomAction => (dispatch) => {
    contractQuery(
      dispatch,
      RC.getAllRepos(type),
      (output:ReposResp) => dispatch(AC.setRepos(output.repos))
    );
  };

  return [{ getOrganizations, getProjects, getRepos }, {
    createProject,
    createOrganization,
    deleteRepo,
    createRepo
  }] as const;
};
