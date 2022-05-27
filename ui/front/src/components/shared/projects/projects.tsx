import { useProject } from '@libs/hooks/container/organization';
import Title from 'antd/lib/typography/Title';
import { useMemo } from 'react';
import { CreateModal, Nav, Search } from '@components/shared';
import { BeamButton } from '../beam-button';
import styles from './projects.module.scss';
import { ProjectList } from './projectList';

const placeholder = 'Enter name of your project';

function Projects() {
  const {
    orgName,
    path,
    type,
    pkey,
    searchText,
    isModal,
    id,
    items,
    setInputText,
    showModal,
    handleOk,
    closeModal
  } = useProject();

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

  const projectManager = useMemo(() => (
    <div className={styles.repoHeader}>
      {pkey && <Nav type={type} items={navItems} />}

      <div className={styles.manage}>
        <div className={styles.searchWrapper}>
          <Search
            text={searchText}
            setInputText={setInputText}
            placeholder="Search by organization name or ID"
          />
        </div>
        {pkey && (
          <div className={styles.buttonWrapper}>
            <BeamButton callback={showModal}>
              Add new
            </BeamButton>
          </div>
        )}
      </div>

      <CreateModal
        isModalVisible={isModal}
        handleCreate={handleOk}
        handleCancel={closeModal}
        placeholder={placeholder}
      />
    </div>
  ), [searchText, pkey, isModal]);
  return (
    <div className={styles.content}>
      <Title level={3}>{`${orgName} projects`}</Title>
      {projectManager}
      <ProjectList
        orgId={id}
        items={items}
        searchText={searchText}
        path={path}
        type={type}
        page={0}
      />
    </div>
  );
}

export default Projects;
