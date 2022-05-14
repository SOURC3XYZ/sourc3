import { useProject } from '@libs/hooks/container/organization';
import { Modal } from 'antd';
import Title from 'antd/lib/typography/Title';
import { useMemo } from 'react';
import { Nav, Search } from '@components/shared';
import { BeamButton } from '../beam-button';
import styles from './projects.module.scss';
import { ProjectList } from './projectList';

function Projects() {
  const {
    orgName,
    path,
    type,
    pkey,
    searchText,
    isModal,
    orgId,
    items,
    setInputText,
    showModal,
    closeModal
  } = useProject();

  const navItems = [
    {
      key: 'all',
      to: `${path}projects/${orgId}/all/1`,
      text: 'All Projects'
    },
    {
      key: 'my',
      to: `${path}projects/${orgId}/my/1`,
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

      <Modal
        visible={isModal}
        onCancel={closeModal}
        closable={false}
      />
    </div>
  ), [searchText, pkey]);
  return (
    <div className={styles.content}>
      <Title level={3}>{`${orgName} projects`}</Title>
      {projectManager}
      <ProjectList
        orgId={orgId}
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
