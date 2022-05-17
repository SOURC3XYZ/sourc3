import { AC, thunks } from '@libs/action-creators';
import { useDispatch, useSelector } from '@libs/redux';
import { OwnerListType } from '@types';
import { useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { getOrgName, getProjectsByOrgId } from './selectors';

type LocationState = {
  orgId: number,
  type: OwnerListType,
  page: string
};

// orgId/:type/:page

const useProject = () => {
  const { pathname } = useLocation();
  const { type, page, orgId } = useParams<'type' & 'page' & 'orgId'>() as LocationState;
  const path = pathname.split('projects/')[0];

  const id = useMemo(() => +orgId, [orgId]);

  const dispatch = useDispatch();
  const pkey = useSelector((state) => state.app.pkey);
  const searchText = useSelector((state) => state.entities.searchText);
  const projects = useSelector(
    (state) => getProjectsByOrgId(id, state.entities.projects, type, pkey)
  );
  const orgName = useSelector(
    (state) => getOrgName(id, state.entities.organizations) || 'NO_NAME'
  );

  const [isModal, setIsModal] = useState(false);

  const setInputText = (txt: string) => dispatch(AC.setSearch(txt));

  const showModal = () => setIsModal(true);

  const closeModal = () => setIsModal(false);

  const handleOk = (name: string) => {
    closeModal();
    console.log(name);
    dispatch(thunks.createProject(name, id));
  };

  return {
    items: projects,
    page: +page,
    orgName,
    path,
    pkey,
    type,
    searchText,
    isModal,
    id,
    setInputText,
    showModal,
    closeModal,
    handleOk
  };
};

export default useProject;
