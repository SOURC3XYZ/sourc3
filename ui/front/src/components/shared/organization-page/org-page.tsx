import {
  EntityWrapper,
  BackButton,
  RepoItem,
  usePathPattern,
  EditOrgForm,
  NavItem
} from '@components/shared';
import { useProject } from '@libs/hooks/container/organization';
import { CSSProperties, useCallback, useMemo } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import TabItem from '../entity/tab-item';
import MemberListItem from './member-list-item';
import ProjectList, { HeaderElements } from './project-list';
import ProjectListItem from './project-list-item';

type RoutesType<T> = {
  headerElements?: HeaderElements;
  path: string,
  items: T[],
  navTitle:string,
  navItems?: NavItem[]
  placeholder:string;
  itemComponent: (item: T) => JSX.Element;
};

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
      items: projects,
      navTitle: 'Projects',
      placeholder: 'enter project name or id',
      headerElements: {
        placeholder: 'Search by project name or ID'
      },
      itemComponent: projectListItem,
      navItems: [
        {
          key: 'all',
          to: `${path}projects/${id}/1/projects?type=all`,
          text: 'All Projects'
        },
        {
          key: 'my',
          to: `${path}projects/${id}/1/projects?type=my`,
          text: 'My Projects'
        }
      ]
    },
    {
      path: 'repos',
      items: repos,
      navTitle: 'Repositories',
      placeholder: 'enter repo name or id',
      headerElements: {
        placeholder: 'Search by repo name or ID'
      },
      itemComponent: repoListItem,
      navItems: [
        {
          key: 'all',
          to: `${path}projects/${id}/1/repos?type=all`,
          text: 'All Repositories'
        },
        {
          key: 'my',
          to: `${path}projects/${id}/1/repos?type=my`,
          text: 'My Repositories'
        }
      ]
    },
    {
      path: 'users',
      items: members,
      navTitle: 'Projects',
      placeholder: 'enter user name',
      headerElements: {
        placeholder: 'Search by username of pid'
      },
      itemComponent: memberListItem
    }
  ];

  const currentRoute = usePathPattern(routes.map((el) => el.path));

  const headerFields = {
    pkey,
    owner: org.organization_creator,
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

  const RoutesView = useMemo(() => routes.map(
    (el) => (
      <Route
        key={el.path}
        path={`/${el.path}`}
        element={(
          <ProjectList
            id={id}
            pkey={pkey}
            placeholder={el.placeholder}
            route={el.path}
            isModal={isModal}
            projects={el.items}
            header={el.headerElements}
            path={path}
            page={page}
            type={type}
            navItems={el.navItems}
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
      <Routes>
        <Route path="/edit" element={<EditOrgForm pkey={pkey} {...org} />} />
        <Route
          path="/*"
          element={(
            <EntityWrapper
              headerFields={headerFields}
              title={org.organization_name || 'NO NAME'}
              pkey={pkey}
            >
              <Routes>
                {RoutesView}
              </Routes>
            </EntityWrapper>
          )}
        />
      </Routes>
    </>
  );
}

export default Projects;
