import { AC } from '@libs/action-creators';
import { useDispatch, useSelector } from '@libs/redux';
import { OwnerListType } from '@types';
import { useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { getOrgName, getProjectsByOrgId } from './selectors';

type LocationState = {
  orgId: number,
  type: OwnerListType,
  page: number
};

// orgId/:type/:page

const useProject = () => {
  const { pathname } = useLocation();
  const { type, page, orgId } = useParams<'type' & 'page' & 'orgId'>() as LocationState;
  const path = pathname.split('projects/')[0];

  const orgIdNum = useMemo(() => +orgId, [orgId]);

  const dispatch = useDispatch();
  const pkey = useSelector((state) => state.app.pkey);
  const searchText = useSelector((state) => state.entities.searchText);
  const projects = useSelector(
    (state) => getProjectsByOrgId(state.entities.projects, type, orgIdNum, pkey)
  );
  const orgName = useSelector(
    (state) => getOrgName(orgIdNum, state.entities.organizations) || 'NO_NAME'
  );

  const [isModal, setIsModal] = useState(false);

  const setInputText = (txt: string) => {
    dispatch(AC.setSearch(txt));
  };

  const showModal = () => {
    setIsModal(true);
  };
  const closeModal = () => {
    setIsModal(false);
  };
  return {
    items: projects,
    orgName,
    path,
    pkey,
    type,
    page,
    searchText,
    isModal,
    orgId: orgIdNum,
    setInputText,
    showModal,
    closeModal
  };
};

export default useProject;
