import { useModal } from '@libs/hooks/shared';
import { useEntitiesAction } from '@libs/hooks/thunk';
import { useSelector } from '@libs/redux';
import { OwnerListType } from '@types';
import { useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { getOrgName, getProjectsByOrgId } from './selectors';

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
  const searchText = useSelector((state) => state.entities.searchText);
  const projects = useSelector(
    (state) => getProjectsByOrgId(id, state.entities.projects, type, pkey)
  );
  const orgName = useSelector(
    (state) => getOrgName(id, state.entities.organizations) || 'NO_NAME'
  );

  const modalApi = useModal(
    (txt: string) => setInputText(txt),
    (name: string) => createProject(name, id)

  );

  return {
    items: projects,
    page: +page,
    orgName,
    path,
    pkey,
    type,
    searchText,
    id,
    modalApi
  };
};

export default useProject;
