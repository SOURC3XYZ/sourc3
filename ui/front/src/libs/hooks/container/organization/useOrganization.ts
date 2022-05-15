import { AC, thunks } from '@libs/action-creators';
import { useSearch } from '@libs/hooks/shared/useSearch';
import { useSelector, useDispatch } from '@libs/redux';
import { OwnerListType } from '@types';
import { useState } from 'react';
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

  const dispatch = useDispatch();
  const pkey = useSelector((state) => state.app.pkey);
  const items = useSelector((state) => itemsFilter(state.entities.organizations, type, pkey));
  const searchText = useSelector((state) => state.entities.searchText);

  const elements = useSearch(searchText, items, ['organization_name', 'organization_id'], type);

  const [isModal, setIsModal] = useState(false);

  const setInputText = (txt: string) => {
    dispatch(AC.setSearch(txt));
  };

  const showModal = () => setIsModal(true);

  const closeModal = () => setIsModal(false);

  const handleOk = (name: string) => {
    closeModal();
    dispatch(thunks.createOrganization(name));
  };

  return {
    items: elements,
    page: +page,
    searchText,
    type,
    pkey,
    path,
    isModal,
    handleOk,
    setInputText,
    showModal,
    closeModal
  };
};

export default useOrganization;
