import { AC, thunks } from '@libs/action-creators';
import { useSearch } from '@libs/hooks/shared/useSearch';
import { useDispatch, useSelector } from '@libs/redux';
import { OwnerListType } from '@types';
import { useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { getProjectName, getReposByProject } from './selectors';

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
    (state) => getProjectName(id, state.entities.projects) || 'NO_NAME'
  );

  const items = useSearch(searchText, repos, ['repo_name', 'repo_id']);

  const [isModal, setIsModal] = useState(false);

  const setInputText = (txt: string) => dispatch(AC.setSearch(txt));

  const showModal = () => {
    setIsModal(true);
  };
  const closeModal = () => {
    setIsModal(false);
  };

  const handleOk = (name: string) => {
    closeModal();
    dispatch(thunks.createRepos(name, id));
  };

  const deleteRepos = () => {};
  return {
    items,
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
    deleteRepos,
    handleOk
  };
};

export default useProjectRepos;
