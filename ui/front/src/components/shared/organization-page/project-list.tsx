import {
  CreateModal,
  EntityList
} from '@components/shared';
import { OwnerListType, Project } from '@types';
import ProjectListItem from './project-list-item';

type ProjectListProps = {
  id: number;
  isModal: boolean;
  searchText: string;
  projects: Project[];
  path:string;
  page: number;
  type: OwnerListType;
  handleOk: (name: string) => void;
  closeModal: () => void;
};

function ProjectList({
  id, isModal, searchText, path, type, projects, page, handleOk, closeModal
}:ProjectListProps) {
  const listItem = (item: typeof projects[number]) => (
    <ProjectListItem
      item={item}
      path={path}
      searchText={searchText}
      type={type}
    />
  );

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
