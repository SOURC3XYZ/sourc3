import { useProjectRepos } from '@libs/hooks/container/organization';
import { Modal } from 'antd';
import Title from 'antd/lib/typography/Title';
import { useMemo } from 'react';
import { Nav, Search } from '@components/shared';
import { BeamButton } from '../beam-button';
import styles from './projects.module.scss';
import { RepoList } from '../all-repos';

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
    deleteRepos,
    setInputText,
    showModal,
    closeModal
  } = useProjectRepos();

  const navItems = [
    {
      key: 'all',
      to: `${path}project/${id}/all/1`,
      text: 'All Repos'
    },
    {
      key: 'my',
      to: `${path}project/${id}/my/1`,
      text: 'My Repos'
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
      <RepoList
        path={path}
        page={0}
        elements={items}
        deleteRepos={deleteRepos}
        type={type}
        searchText={searchText}
      />
    </div>
  );
}

export default ProjectRepos;
