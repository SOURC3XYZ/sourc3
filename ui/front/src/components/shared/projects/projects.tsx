import {
  CreateModal,
  EntityList,
  EntityWrapper,
  BackButton
} from '@components/shared';
import { useProject } from '@libs/hooks/container/organization';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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

  const navigate = useNavigate();

  const back = useCallback(() => navigate(-1), []);

  const isElectron = useMemo(() => {
    const ua = navigator.userAgent;
    return /SOURC3-DESKTOP/i.test(ua);
  }, []);

  const style = {
    position: 'relative',
    left: '0',
    top: '-150px'
  };

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
        {isElectron ? <BackButton inlineStyles={style} onClick={back} /> : null}
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
