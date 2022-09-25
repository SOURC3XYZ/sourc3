/* eslint-disable prefer-destructuring */
import { CustomAction } from '@libs/redux';
import {
  ArgumentTypes,
  CallBeamApi, IProfile,
  OrganizationsResp, PKeyRes,
  ProjectsResp,
  RepoListType,
  ReposResp
} from '@types';
import { AC } from '../action-creators';
import { contractCall } from '../helpers';
import { RC, RequestSchema } from '../request-schemas';

export const entitiesThunk = (callApi: CallBeamApi<RequestSchema['params']>) => {
  const [contractQuery, contractMutation, getOutput] = contractCall(callApi);

  const createRepo = (
    name: string,
    projectId: number,
    priv: 0 | 1,
    pid = 0
  ):CustomAction => async (dispatch) => contractMutation(
    dispatch,
    RC.createRepo(name, projectId, priv, pid)
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

  const createProject = (state: any):CustomAction => async (dispatch) => contractMutation(
    dispatch,
    RC.createProject({ ...state })
  );

  const getOrganizations = ():CustomAction => async (dispatch) => contractQuery(
    dispatch,
    RC.getOrganizations(),
    (output:OrganizationsResp) => [AC.setOrganizationsList(output.organizations)]
  );

  const setModifyOrganization = (state:any):CustomAction => async (dispatch) => contractMutation(
    dispatch,
    RC.setModifyOrganization({ ...state })
  );

  const setModifyProject = (state:any):CustomAction => async (dispatch) => contractMutation(
    dispatch,
    RC.setModifyProject({ ...state })
  );

  const setModifyUser = (state:any):CustomAction => async (dispatch) => contractMutation(
    dispatch,
    RC.setModifyUser(state)
  );

  const getProjects = ():CustomAction => async (dispatch) => {
    contractQuery(
      dispatch,
      RC.getProjects(),
      (output:ProjectsResp) => [AC.setProjectsList(output.projects)]
    );
  };

  const getRepos = (type:RepoListType):CustomAction => async (dispatch) => {
    const reposResp = await getOutput<ReposResp>(RC.getAllRepos(type), dispatch);
    if (reposResp) {
      const { repos } = reposResp;
      dispatch(AC.setRepos(repos));
    }
  };
  const getViewUser = ():CustomAction => async (dispatch) => {
    await contractQuery<PKeyRes>(
      dispatch,
      RC.getPublicKey(),
      (output) => {
        contractQuery<IProfile>(
          dispatch,
          RC.getUser(output.key),
          (profile) => [AC.setViewUser(profile)]
        );
        return [];
      }
    );
  };

  const addMemberToOrg = (
    ...args: ArgumentTypes<typeof RC['addOrganizationMember']>
  ):CustomAction => async (dispatch) => contractMutation(
    dispatch,
    RC.addOrganizationMember(...args)
  );

  const addMemberToProject = (
    ...args: ArgumentTypes<typeof RC['addProjectMember']>
  ):CustomAction => async (dispatch) => contractMutation(
    dispatch,
    RC.addProjectMember(...args)
  );

  return [{
    getOrganizations, getProjects, getRepos, setModifyUser, getViewUser
  }, {
    createProject,
    addMemberToOrg,
    createOrganization,
    setModifyOrganization,
    deleteRepo,
    createRepo,
    setModifyProject,
    addMemberToProject
  }] as const;
};
