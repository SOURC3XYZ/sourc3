/* eslint-disable no-restricted-syntax */
import { RC } from '@libs/action-creators';
import { useCallApi } from '@libs/hooks/shared';
import { useEntitiesAction } from '@libs/hooks/thunk';
import { useSelector } from '@libs/redux';
import { getQueryParam, unorderedRemove } from '@libs/utils';
import {
  MemberId,
  MemberList,
  Organization, OwnerListType
} from '@types';
import {
  useCallback,
  useEffect,
  useMemo, useState
} from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getOrg, getProjectsByOrgId } from './selectors';

type LocationState = {
  orgName: string
};

const useProject = () => {
  const { pathname } = useLocation();
  const { orgName } = useParams<'orgName'>() as LocationState;
  const path = pathname.split('projects/')[0];

  const type:OwnerListType = useMemo(() => (
    getQueryParam(window.location.href, 'type') === 'my' ? 'my' : 'all'
  ), [window.location.href]);

  const { addMemberToOrg } = useEntitiesAction();

  const page = useMemo(
    () => {
      const curPage = getQueryParam(window.location.href, 'page');
      if (curPage) return +curPage;
      return 1;
    },
    [window.location.href]
  );

  const [callApi] = useCallApi();

  const [members, setMembers] = useState<MemberId[]>([]);

  // const { setInputText, createProject } = useEntitiesAction();
  const pkey = useSelector((state) => state.app.pkey);
  // const pid = useSelector((state) => state.app.pid);
  const searchText = useSelector((state) => state.entities.searchText);
  const projects = useSelector(
    (state) => getProjectsByOrgId(orgName, state.entities.projects, type, pkey)
  );
  const org = useSelector(
    (state) => getOrg(orgName, state.entities.organizations)
  );

  const allRepos = useSelector((state) => state.entities.repos);

  const navigate = useNavigate();

  const repos = useMemo(() => {
    const allReposCopy = [...allRepos];
    const foundRepos = [];
    const indexes = [];
    for (const project of projects) {
      for (let i = 0; i < allReposCopy.length; i++) {
        if (project.project_name === allReposCopy[i].project_name) {
          foundRepos.push(allReposCopy[i]);
          indexes.push(i);
        }
      }
      if (indexes.length) {
        indexes.forEach((_, ind) => unorderedRemove(allReposCopy, ind));
        indexes.length = 0;
      }
    }
    return foundRepos;
  }, [projects, allRepos]);

  // const modalApi = useModal(
  //   (txt: string) => setInputText(txt),
  //   (name: string) => createProject(name, id, pid)
  // );
  const goBack = useCallback(() => navigate('projects'), []);

  const getOrgMembers = useCallback(async () => {
    const recievedMembers = await callApi<MemberList>(RC.getOrgMembers(orgName));
    if (recievedMembers) setMembers(recievedMembers.members);
  }, []);

  const yourPermissions = useMemo(
    () => {
      const foundPermissions = members.find((el) => el.member === pkey)?.permissions;
      if (foundPermissions) {
        return foundPermissions
          .toString(2)
          .split('')
          .map((el) => !!+el)
          .reverse();
      } return null;
    },
    [members]
  );

  useEffect(() => {
    getOrgMembers();
  }, []);

  return {
    projects,
    members,
    page: +page,
    org: org as Organization,
    path,
    pkey,
    type,
    searchText,
    orgName,
    yourPermissions,
    // modalApi,
    repos,
    navigate,
    goBack,
    addMemberToOrg
  };
};

export default useProject;
