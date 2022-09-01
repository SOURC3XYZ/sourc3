/* eslint-disable no-restricted-syntax */
import { useModal } from '@libs/hooks/shared';
import { useEntitiesAction } from '@libs/hooks/thunk';
import { useSelector } from '@libs/redux';
import { unorderedRemove } from '@libs/utils';
import {
  Organization, OwnerListType
} from '@types';
import {
  useMemo
} from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { getOrg, getProjectsByOrgId } from './selectors';

type LocationState = {
  orgId: number,
  type: OwnerListType,
  page: string
};

const useProject = () => {
  const { pathname } = useLocation();
  const { type, page, orgId } = useParams<'type' & 'page' & 'orgId'>() as LocationState;
  const path = pathname.split('projects/')[0];

  const id = useMemo(() => +orgId, [orgId]);

  const { setInputText, createProject } = useEntitiesAction();
  const pkey = useSelector((state) => state.app.pkey);
  const pid = useSelector((state) => state.app.pid);
  const searchText = useSelector((state) => state.entities.searchText);
  const projects = useSelector(
    (state) => getProjectsByOrgId(id, state.entities.projects, type, pkey)
  );
  const org = useSelector(
    (state) => getOrg(id, state.entities.organizations)
  );

  const allRepos = useSelector((state) => state.entities.repos);

  const repos = useMemo(() => {
    const allReposCopy = [...allRepos];
    const foundRepos = [];
    const indexes = [];
    for (const project of projects) {
      for (let i = 0; i < allReposCopy.length; i++) {
        if (project.project_id === allReposCopy[i].project_id) {
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

  const modalApi = useModal(
    (txt: string) => setInputText(txt),
    (name: string) => createProject(name, id, pid)

  );

  return {
    projects,
    page: +page,
    org: org as Organization,
    path,
    pkey,
    type,
    searchText,
    id,
    modalApi,
    repos
  };
};

export default useProject;
