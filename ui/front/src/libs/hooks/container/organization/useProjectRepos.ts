import { RC } from '@libs/action-creators';
import { useCallApi, useModal } from '@libs/hooks/shared';
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
  projId: string,
  page: string
};

const useProjectRepos = () => {
  const { pathname } = useLocation();
  const { projId } = useParams<keyof LocationState>() as LocationState;
  const path = pathname.split('project/')[0];

  const type:OwnerListType = useMemo(() => (
    getQueryParam(window.location.href, 'type') === 'my' ? 'my' : 'all'
  ), [window.location.href]);

  const page = useMemo(
    () => {
      const curPage = getQueryParam(window.location.href, 'page');
      if (curPage) return +curPage;
      return 1;
    },
    [window.location.href]
  );

  const id = useMemo(() => +projId, [projId]);

  const { setInputText, createRepo } = useEntitiesAction();

  const [callApi] = useCallApi();

  const navigate = useNavigate();

  const pkey = useSelector((state) => state.app.pkey);
  const pid = useSelector((state) => state.app.pid);
  const searchText = useSelector((state) => state.entities.searchText);
  const repos = useSelector(
    (state) => getReposByProject(id, state.entities.repos, type, pkey)
  );
  const project = useSelector(
    (state) => getProjectName(id, state.entities.projects)
  );

  const modalApi = useModal(
    (txt: string) => setInputText(txt),
    (name: string) => createRepo(name, id, pid)
  );

  const [members, setMembers] = useState<MemberId[]>([]);

  const getOrgMembers = useCallback(async () => {
    const recievedMembers = await callApi<MemberList>(RC.getProjectMembers(id));
    if (recievedMembers) setMembers(recievedMembers.members);
  }, []);

  const goBack = useCallback(() => navigate('repos'), []);

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
    id,
    modalApi,
    navigate,
    deleteRepo,
    goBack
  };
};

export default useProjectRepos;
