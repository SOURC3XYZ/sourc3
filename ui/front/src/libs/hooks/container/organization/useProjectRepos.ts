import { useModal } from '@libs/hooks/shared';
import { useSearch } from '@libs/hooks/shared/useSearch';
import { useEntitiesAction } from '@libs/hooks/thunk';
import { useSelector } from '@libs/redux';
import { OwnerListType } from '@types';
import { useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { getProjectName, getReposByProject } from './selectors';

type LocationState = {
  projId: string,
  type: OwnerListType,
  page: string
};

const useProjectRepos = () => {
  const { pathname } = useLocation();
  const { type, page, projId } = useParams<'type' & 'page' & 'projId'>() as LocationState;
  const path = pathname.split('project/')[0];

  const id = useMemo(() => +projId, [projId]);

  const { setInputText, createRepo } = useEntitiesAction();

  const pkey = useSelector((state) => state.app.pkey);
  const pid = useSelector((state) => state.app.pid);
  const searchText = useSelector((state) => state.entities.searchText);
  const repos = useSelector(
    (state) => getReposByProject(id, state.entities.repos, type, pkey)
  );
  const projectName = useSelector(
    (state) => getProjectName(id, state.entities.projects) || 'NO_NAME'
  );

  const items = useSearch(searchText, repos, ['repo_name', 'repo_id']);

  const modalApi = useModal(
    (txt: string) => setInputText(txt),
    (name: string) => createRepo(name, id, pid)
  );

  const deleteRepo = () => {};
  return {
    items,
    projectName,
    path,
    pkey,
    type,
    page: +page,
    searchText,
    id,
    modalApi,
    deleteRepo
  };
};

export default useProjectRepos;
