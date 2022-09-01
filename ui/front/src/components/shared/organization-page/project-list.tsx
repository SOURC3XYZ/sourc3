import {
  CreateModal,
  EntityList
} from '@components/shared';
import { OwnerListType } from '@types';

type ProjectListProps<T> = {
  id: number;
  isModal: boolean;
  searchText: string;
  projects: T[];
  path:string;
  page: number;
  type: OwnerListType;
  listItem: (item: T) => JSX.Element;
  handleOk: (name: string) => void;
  closeModal: () => void;
};

function ProjectList<T>({
  id, isModal, searchText, path, type, projects, page, listItem, handleOk, closeModal
}:ProjectListProps<T>) {
  return (
    <>
      <CreateModal
        title="Add new project to organization"
        label="Project name"
        isModalVisible={isModal}
        placeholder="Enter your project name"
        handleCreate={handleOk}
        handleCancel={closeModal}
      />
      <EntityList
        searchText={searchText}
        renderItem={listItem}
        route={`projects/${id}`}
        path={path}
        page={page}
        items={projects}
        type={type}
      />
    </>
  );
}

export default ProjectList;
