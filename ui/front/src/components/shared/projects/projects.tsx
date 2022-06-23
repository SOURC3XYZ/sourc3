import {
  CreateModal,
  EntityList,
  EntityWrapper
} from '@components/shared';
import { useProject } from '@libs/hooks/container/organization';
import ProjectListItem from './project-list-item';

const placeholder = 'Enter name of your project';

function Projects() {
  const {
    id,
    orgName,
    page,
    path,
    type,
    pkey,
    searchText,
    items,
    modalApi
  } = useProject();

  const {
    isModal,
    setInputText,
    showModal,
    handleOk,
    closeModal
  } = modalApi;

  const navItems = [
    {
      key: 'all',
      to: `${path}projects/${id}/all/1`,
      text: 'All Projects'
    },
    {
      key: 'my',
      to: `${path}projects/${id}/my/1`,
      text: 'My Projects'
    }
  ];

  const listItem = (item: typeof items[number]) => (
    <ProjectListItem
      item={item}
      path={path}
      searchText={searchText}
      type={type}
    />
  );

  return (
    <EntityWrapper
      title={`${orgName} projects`}
      type={type}
      pkey={pkey}
      searchText={searchText}
      navItems={navItems}
      setInputText={setInputText}
      placeholder={placeholder}
      showModal={showModal}
    >
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
          items={items}
          type={type}
        />
      </>
    </EntityWrapper>
  );
}

export default Projects;
