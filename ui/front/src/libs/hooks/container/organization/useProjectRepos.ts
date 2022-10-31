import { RC } from '@libs/action-creators';
import { useCallApi } from '@libs/hooks/shared';
import { useEntitiesAction } from '@libs/hooks/thunk';
import { useSelector } from '@libs/redux';
import { getQueryParam } from '@libs/utils';
import {
  MemberId, MemberList, OwnerListType, Project
} from '@types';
import {
  useCallback, useEffect, useMemo, useState
} from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getProjectName, getReposByProject } from './selectors';

type LocationState = {
  projectName: string,
};

const useProjectRepos = () => {
  const { pathname } = useLocation();
  const { projectName } = useParams<keyof LocationState>() as LocationState;
  const path = pathname.split('project/')[0];

  const type:OwnerListType = useMemo(() => (
    getQueryParam(window.location.href, 'type') === 'my' ? 'my' : 'all'
  ), [window.location.href]);

  const { addMemberToProject } = useEntitiesAction();

  const page = useMemo(
    () => {
      const curPage = getQueryParam(window.location.href, 'page');
      if (curPage) return +curPage;
      return 1;
    },
    [window.location.href]
  );

  const [callApi] = useCallApi();

  const navigate = useNavigate();

  const item = useSelector(
    (state) => state.entities.projects.find((el) => el.project_name === projectName)
  );
  const pkey = useSelector((state) => state.app.pkey);
  const searchText = useSelector((state) => state.entities.searchText);
  const repos = useSelector(
    (state) => getReposByProject(projectName, state.entities.repos, type, pkey)
  );
  const project = useSelector(
    (state) => getProjectName(projectName, state.entities.projects)
  );

  const [members, setMembers] = useState<MemberId[]>([]);

  const getOrgMembers = useCallback(async () => {
    if (item) {
      const recievedMembers = await callApi<MemberList>(
        RC.getProjectMembers(
          projectName,
          item.organization_name
        )
      );
      if (recievedMembers) setMembers(recievedMembers.members);
    }
  }, []);

  const goBack = useCallback(() => navigate('repos'), []);

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

  const deleteRepo = () => {};
  return {
    repos,
    members,
    project: project as Project,
    path,
    pkey,
    type,
    page: +page,
    searchText,
    projectName,
    yourPermissions,
    navigate,
    deleteRepo,
    addMemberToProject,
    goBack
  };
};

export default useProjectRepos;
