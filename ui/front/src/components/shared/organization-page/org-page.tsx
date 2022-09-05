import {
  EntityWrapper,
  BackButton,
  RepoItem,
  usePathPattern
} from '@components/shared';
import { useProject } from '@libs/hooks/container/organization';
import { CSSProperties, useCallback, useMemo } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import TabItem from '../entity/tab-item';
import MemberListItem from './member-list-item';
import ProjectList, { HeaderElements } from './project-list';
import ProjectListItem from './project-list-item';

type RoutesType<T> = {
  path: string,
  items: T[],
  navTitle:string,
  itemComponent: (item: T) => JSX.Element;
  headerElements?: HeaderElements;
};

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
    repos,
    members
  } = useProject();

  const {
    isModal,
    setInputText,
    showModal,
    handleOk,
    closeModal
  } = modalApi;

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
      label: <TabItem title="Members" count={members.length} />
    }
  ], [repos, projects, members]);

  const projectListItem = (item: typeof projects[number]) => (
    <ProjectListItem
      item={item}
      path={path}
      searchText={searchText}
      type={type}
    />
  );

  const repoListItem = (item: typeof repos[number]) => (
    <RepoItem
      item={item}
      path={path}
      searchText={searchText}
      deleteRepo={() => {}}
    />
  );

  const memberListItem = (item: typeof members[number]) => (
    <MemberListItem
      item={item}
      path={path}
      searchText={searchText}
    />
  );

  const routes: RoutesType<any>[] = [
    {
      path: 'projects',
      itemComponent: projectListItem,
      items: projects,
      navTitle: 'Projects',
      headerElements: {
        placeholder: 'Search by project name or ID'
      }
    },
    {
      path: 'repos',
      itemComponent: repoListItem,
      items: repos,
      navTitle: 'Repositories',
      headerElements: {
        placeholder: 'Search by repo name or ID'
      }
    },
    {
      path: 'users',
      itemComponent: memberListItem,
      items: members,
      navTitle: 'Projects',
      headerElements: {
        placeholder: 'Search by username of pid'
      }
    }
  ];

  const headerFields = {
    routes: routes.map((el) => el.path),
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

  const currentRoute = usePathPattern(routes.map((el) => el.path));

  const navItems = [
    {
      key: 'all',
      to: `${path}projects/${id}/all/1/${currentRoute}`,
      text: 'All Projects'
    },
    {
      key: 'my',
      to: `${path}projects/${id}/my/1/${currentRoute}`,
      text: 'My Projects'
    }
  ];

  const RoutesView = useMemo(() => routes.map(
    (el) => (
      <Route
        key={el.path}
        path={`/${el.path}`}
        element={(
          <ProjectList
            id={id}
            route={el.path}
            isModal={isModal}
            searchText={searchText}
            projects={el.items}
            header={el.headerElements}
            path={path}
            page={page}
            type={type}
            handleOk={handleOk}
            closeModal={closeModal}
            listItem={el.itemComponent}
          />
        )}
      />
    )
  ), [projects, members, repos, currentRoute]);

  return (
    <>
      {backButton}
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
          {RoutesView}
        </Routes>
      </EntityWrapper>
    </>

  );
}

export default Projects;
