import { useProjectRepos } from '@libs/hooks/container/organization';
import {
  EntityWrapper,
  EntityList,
  CreateModal,
  RepoItem
} from '@components/shared';

const placeholder = 'Enter your repository name';

function ProjectRepos() {
  const {
    projectName,
    path,
    type,
    pkey,
    searchText,
    id,
    items,
    page,
    modalApi,
    deleteRepo
  } = useProjectRepos();

  const {
    isModal,
    setInputText,
    showModal,
    closeModal,
    handleOk
  } = modalApi;

  const navItems = [
    {
      key: 'all',
      to: `${path}project/${id}/all/1`,
      text: 'All Repositories'
    },
    {
      key: 'my',
      to: `${path}project/${id}/my/1`,
      text: 'My Repositories'
    }
  ];

  const listItem = (item: typeof items[number]) => (
    <RepoItem
      item={item}
      path={path}
      searchText={searchText}
      deleteRepo={deleteRepo}
    />
  );

  return (
    <EntityWrapper
      title={`${projectName} repos`}
      type={type}
      pkey={pkey}
      searchText={searchText}
      navItems={navItems}
      placeholder={placeholder}
      setInputText={setInputText}
      showModal={showModal}
    >
      <>
        <CreateModal
          isModalVisible={isModal}
          placeholder="Enter your repository name"
          handleCreate={handleOk}
          handleCancel={closeModal}
        />
        <EntityList
          searchText={searchText}
          renderItem={listItem}
          route={`project/${id}`}
          path={path}
          page={page}
          items={items}
          type={type}
        />
      </>
    </EntityWrapper>
  );
}

export default ProjectRepos;
