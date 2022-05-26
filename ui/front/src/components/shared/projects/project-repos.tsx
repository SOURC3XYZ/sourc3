import { useProjectRepos } from '@libs/hooks/container/organization';
import Title from 'antd/lib/typography/Title';
import { useMemo } from 'react';
import { Nav, Search } from '@components/shared';
import { BeamButton } from '../beam-button';
import styles from './projects.module.scss';
import { EntityList } from '../entity-list';
import { CreateModal } from '../create-modal';

const placeholder = 'Enter your repository name';

function ProjectRepos() {
  const {
    orgName,
    path,
    type,
    pkey,
    searchText,
    isModal,
    id,
    items,
    page,
    deleteRepos,
    setInputText,
    showModal,
    closeModal,
    handleOk
  } = useProjectRepos();

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
      <Title level={3}>{`${orgName} repositories`}</Title>
      {projectManager}
      <EntityList
        path={path}
        page={page}
        route="project"
        items={items}
        deleteRepos={deleteRepos}
        type={type}
        searchText={searchText}
      />
    </div>
  );
}

export default ProjectRepos;
