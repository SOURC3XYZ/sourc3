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
  orgName: string;
  projects: T[];
  path:string;
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
  route: string;
  createEntity?: () => void;
  listItem: (searchText:string) => (item: T) => JSX.Element;
};

function ProjectList<T>({
  orgName,
  navItems,
  placeholder,
  path,
  type,
  pkey,
  projects,
  page,
  header,
  route,
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
        route={`${route}/${orgName}`}
        path={path}
        page={page}
        items={foundedItems}
        type={type}
        renderItem={listItem(searchText)}
      />
    </>
  );
}

export default ProjectList;
