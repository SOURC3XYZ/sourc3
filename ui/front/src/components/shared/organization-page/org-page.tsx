import {
  EntityWrapper,
  BackButton
} from '@components/shared';
import { useProject } from '@libs/hooks/container/organization';
import { CSSProperties, useCallback, useMemo } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import TabItem from '../entity/tab-item';
import ProjectList from './project-list';

const placeholder = 'Enter name of your project';

function Projects() {
  const {
    id,
    org,
    page,
    path,
    type,
    pkey,
    searchText,
    projects,
    modalApi,
    repos
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

  const navigate = useNavigate();

  const back = useCallback(() => navigate(-1), []);

  const isElectron = useMemo(() => {
    const ua = navigator.userAgent;
    return /SOURC3-DESKTOP/i.test(ua);
  }, []);

  const style:CSSProperties = {
    position: 'relative',
    left: '0',
    top: '-150px'
  };

  const backButton = useMemo(() => (
    isElectron && <BackButton inlineStyles={style} onClick={back} />), []);

  const tabData = useMemo(() => [
    {
      id: 0,
      label: <TabItem title="Projects" count={projects.length} />
    },
    {
      id: 1,
      label: <TabItem title="Repositories" count={repos.length} />
    },
    {
      id: 2,
      label: <TabItem title="Members" count={0} />
    }
  ], [repos, projects]);

  const headerFields = {
    routes: ['projects', 'repos', 'users'],
    avatar: org.organization_logo_ipfs_hash,
    shortTitle: org.organization_short_title,
    description: org.organization_about,
    socialLinks: {
      website: org.organization_website,
      twitter: org.organization_twitter,
      instagram: org.organization_twitter,
      telegram: org.organization_telegram,
      linkedin: org.organization_linkedin,
      discord: org.organization_discord
    },
    tabData
  };

  return (
    <EntityWrapper
      headerFields={headerFields}
      title={org.organization_name || 'NO NAME'}
      type={type}
      pkey={pkey}
      searchText={searchText}
      navItems={navItems}
      setInputText={setInputText}
      placeholder={placeholder}
      showModal={showModal}
    >
      <Routes>
        {backButton}
        <Route
          path="/projects"
          element={(
            <ProjectList
              id={id}
              isModal={isModal}
              searchText={searchText}
              projects={projects}
              path={path}
              page={page}
              type={type}
              handleOk={handleOk}
              closeModal={closeModal}
            />
          )}
        />
      </Routes>
    </EntityWrapper>
  );
}

export default Projects;
