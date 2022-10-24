import { useModal } from '@libs/hooks/shared';
import { useSearch } from '@libs/hooks/shared/useSearch';
import { useEntitiesAction } from '@libs/hooks/thunk';
import { useSelector } from '@libs/redux';
import { OwnerListType } from '@types';
import { useLocation, useParams } from 'react-router-dom';
import { itemsFilter } from './selectors';

type LocationState = {
  page: string,
  type: OwnerListType
};

const useOrganization = () => {
  const { pathname } = useLocation();
  const { type, page } = useParams<'type' & 'page'>() as LocationState;
  const path = pathname.split('organizations/')[0];

  const { setInputText, createOrganization } = useEntitiesAction();
  const pkey = useSelector((state) => state.app.pkey);
  const pid = useSelector((state) => state.app.pid);
  const items = useSelector((state) => itemsFilter(state.entities.organizations, type, pkey));
  const searchText = useSelector((state) => state.entities.searchText);

  const elements = useSearch(searchText, items, ['organization_name', 'organization_id'], type);

  const modalApi = useModal(
    (txt: string) => setInputText(txt),
    (name: string) => createOrganization(name, pid)
  );

  return {
    items: elements,
    page: +page,
    searchText,
    type,
    pkey,
    path,
    modalApi
  };
};

export default useOrganization;
