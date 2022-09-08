import {
  CreateModal,
  EntityList,
  EntityManager,
  NavItem
} from '@components/shared';
import { OwnerListType } from '@types';
import { useState } from 'react';

export type HeaderElements = {
  title?: string,
  label?: string,
  placeholder?: string
};

type ProjectListProps<T> = {
  id: number;
  isModal: boolean;
  projects: T[];
  path:string;
  page: number;
  pkey: string;
  type: OwnerListType;
  placeholder:string;
  navItems?: NavItem[];
  header?: {
    title?: string,
    label?: string,
    placeholder?: string
  },
  route: string;
  showModal?: () => void;
  listItem: (item: T) => JSX.Element;
  handleOk: (name: string) => void;
  closeModal: () => void;
};

function ProjectList<T>({
  id,
  isModal,
  navItems,
  placeholder,
  path,
  type,
  pkey,
  projects,
  page,
  header,
  route,
  showModal,
  listItem,
  handleOk,
  closeModal
}:ProjectListProps<T>) {
  const [searchText, setSearchText] = useState('');

  const setInputText = (str: string) => {
    setSearchText(str);
  };

  return (
    <>
      <EntityManager
        type={type}
        pkey={pkey}
        searchText={searchText}
        navItems={navItems}
        setInputText={setInputText}
        placeholder={placeholder}
        showModal={showModal}
      />
      <CreateModal
        title={header?.title || ''}
        label={header?.label || ''}
        isModalVisible={isModal}
        placeholder={header?.placeholder || ''}
        handleCreate={handleOk}
        handleCancel={closeModal}
      />
      <EntityList
        searchText={searchText}
        renderItem={listItem}
        route={`${route}/${id}`}
        path={path}
        page={page}
        items={projects}
        type={type}
      />
    </>
  );
}

export default ProjectList;
