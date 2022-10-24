import {
  CreateModal,
  EntityList,
  EntityManager,
  NavItem
} from '@components/shared';
import { useSearch } from '@libs/hooks/shared/useSearch';
import { OwnerListType } from '@types';
import {
  useCallback, useMemo, useState
} from 'react';

export type HeaderElements = {
  title?: string,
  label?: string,
  placeholder?: string
};

type ProjectListProps<T> = {
  projects: T[];
  page: number;
  pkey: string;
  type: OwnerListType;
  placeholder:string;
  isShowNav: boolean;
  fieldsToSearch:(keyof T)[]
  navItems?: NavItem[];
  header?: {
    title?: string,
    label?: string,
    placeholder?: string
  },
  createEntity?: () => void;
  listItem: (searchText:string) => (item: T) => JSX.Element;
};

function ProjectList<T>({
  navItems,
  placeholder,
  type,
  pkey,
  projects,
  page,
  header,
  isShowNav,
  fieldsToSearch,
  listItem,
  createEntity
}:ProjectListProps<T>) {
  const [searchText, setSearchText] = useState('');

  const foundedItems = useSearch(searchText, projects, fieldsToSearch);

  const [isModalVisile, showModal] = useState(false);

  const setInputText = useCallback((str: string) => setSearchText(str), [searchText]);

  const showModalHandler = useCallback(() => createEntity && createEntity(), [createEntity]);

  const closeModal = useCallback(() => showModal(false), []);

  const isAddBtnVisible = useMemo(() => !!createEntity, [createEntity]);

  return (
    <>
      <EntityManager
        type={type}
        pkey={pkey}
        navItems={navItems}
        isShowNav={isShowNav}
        placeholder={placeholder}
        searchText={searchText}
        isAddBtnVisible={isAddBtnVisible}
        setInputText={setInputText}
        showModal={showModalHandler}
      />
      <CreateModal
        title={header?.title || ''}
        label={header?.label || ''}
        placeholder={header?.placeholder || ''}
        isModalVisible={isModalVisile}
        handleCreate={createEntity}
        handleCancel={closeModal}
      />
      <EntityList
        searchText={searchText}
        page={page}
        items={foundedItems}
        renderItem={listItem(searchText)}
      />
    </>
  );
}

export default ProjectList;
