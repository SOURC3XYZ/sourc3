import {
  CreateModal,
  EntityList
} from '@components/shared';
import { OwnerListType } from '@types';

export type HeaderElements = {
  title?: string,
  label?: string,
  placeholder?: string
};

type ProjectListProps<T> = {
  id: number;
  isModal: boolean;
  searchText: string;
  projects: T[];
  path:string;
  page: number;
  type: OwnerListType;
  header?: {
    title?: string,
    label?: string,
    placeholder?: string
  },
  route: string;
  listItem: (item: T) => JSX.Element;
  handleOk: (name: string) => void;
  closeModal: () => void;
};

function ProjectList<T>({
  id,
  isModal,
  searchText,
  path,
  type,
  projects,
  page,
  header,
  route,
  listItem,
  handleOk,
  closeModal
}:ProjectListProps<T>) {
  return (
    <>
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
