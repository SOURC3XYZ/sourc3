/* eslint-disable prefer-destructuring */
import { CustomAction } from '@libs/redux';
import { buf2hex, hexParser } from '@libs/utils';
import {
  CallBeamApi,
  ObjectDataResp,
  OrganizationsResp,
  ProjectsResp,
  RepoCommitResp,
  RepoListType,
  RepoRefsResp,
  ReposResp
} from '@types';
import { AC } from '../action-creators';
import { contractCall } from '../helpers';
import { RC } from '../request-schemas';

export const entitiesThunk = (callApi: CallBeamApi) => {
  const [contractQuery, contractMutation, getOutput] = contractCall(callApi);

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

  const getRepos = (type:RepoListType):CustomAction => async (dispatch) => {
    const reposResp = await getOutput<ReposResp>(RC.getAllRepos(type), dispatch);
    if (reposResp) {
      const { repos } = reposResp;
      const promises = repos.map(async (repo) => {
        const refsResp = await getOutput<RepoRefsResp>(RC.repoGetRefs(repo.repo_id), dispatch);
        try {
          if (refsResp) {
            const { refs } = refsResp;
            if (!refs.length) throw new Error();
            let master = refs.find((ref) => ref.name.match(/(master|main)/));

            if (!master) master = refs[0];
            const commitData = await getOutput<ObjectDataResp>(
              RC.getData(repo.repo_id, master.commit_hash),
              dispatch
            );
            if (commitData) {
              const ipfsHash = hexParser(commitData.object_data);
              const ipfsData = await callApi(RC.getIpfsData(ipfsHash));
              if (ipfsData) {
                const toParse = buf2hex(ipfsData.result.data as number[]);
                const getCommitFromIpfs = await getOutput<RepoCommitResp>(
                  RC.getCommitFromData(master.commit_hash, toParse),
                  dispatch
                );
                if (getCommitFromIpfs) {
                  return { ...repo, lastCommit: getCommitFromIpfs.commit };
                }
              }
            }
          } throw new Error();
        } catch (error) {
          return { ...repo, lastCommit: null };
        }
      });

      const fullRepos = await Promise.all(promises);
      dispatch(AC.setRepos(fullRepos));

      // const promises = repos
      //   .map((el) => getOutput<RepoRefsResp>(RC.repoGetRefs(el.repo_id), dispatch));
      // const refsResp = await Promise.all(promises);
      // const commitPromises = refsResp.map((el, i) => {
      //   const id = repos[i].repo_id;
      //   if (el) {
      //     const master = el.refs.find((ref) => ref.name.match(/(master|main)/));
      //     if (!el.refs.length) return Promise.resolve(null);
      //     if (!master) {
      //       const first = el.refs[0];
      //       return <Promise<BranchCommit>>getOutput(
      //         RC.repoGetCommit(id, first.commit_hash),
      //         dispatch
      //       );
      //     } return <Promise<BranchCommit>>getOutput(
      //       RC.repoGetCommit(id, master.commit_hash),
      //       dispatch
      //     );
      //   } return Promise.resolve(null);
      // });
      // const lastCommits = await Promise.all(commitPromises);
      // const fullRepos = lastCommits.map((el, i) => ({ ...repos[i], lastCommit: el }));
      // dispatch(AC.setRepos(fullRepos));
    }

    // contractQuery(
    //   dispatch,
    //   RC.getAllRepos(type),
    //   (output:ReposResp) => dispatch(AC.setRepos(output.repos))
    // );
  };

  return [{ getOrganizations, getProjects, getRepos }, {
    createProject,
    createOrganization,
    deleteRepo,
    createRepo
  }] as const;
};
