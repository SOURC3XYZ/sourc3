import { AC } from '@libs/action-creators';
import { useDispatch, useSelector } from '@libs/redux';
import { OwnerListType } from '@types';
import { useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { getOrgName, getReposByProject } from './selectors';

type LocationState = {
  projId: string,
  type: OwnerListType,
  page: number
};

// orgId/:type/:page

const useProjectRepos = () => {
  const { pathname } = useLocation();
  const { type, page, projId } = useParams<'type' & 'page' & 'projId'>() as LocationState;
  const path = pathname.split('project/')[0];

  const id = useMemo(() => +projId, [projId]);

  const dispatch = useDispatch();
  const pkey = useSelector((state) => state.app.pkey);
  const searchText = useSelector((state) => state.entities.searchText);
  const repos = useSelector(
    (state) => getReposByProject(id, state.entities.repos, type, pkey)
  );
  const orgName = useSelector(
    (state) => getOrgName(id, state.entities.organizations) || 'NO_NAME'
  );

  const [isModal, setIsModal] = useState(false);

  const setInputText = (txt: string) => dispatch(AC.setSearch(txt));

  const showModal = () => {
    setIsModal(true);
  };
  const closeModal = () => {
    setIsModal(false);
  };

  const deleteRepos = () => {};
  return {
    items: repos,
    orgName,
    path,
    pkey,
    type,
    page,
    searchText,
    isModal,
    id,
    setInputText,
    showModal,
    closeModal,
    deleteRepos
  };
};

export default useProjectRepos;
