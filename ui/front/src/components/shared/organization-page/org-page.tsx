/* eslint-disable react/no-unstable-nested-components */
import {
  EntityWrapper,
  BackButton,
  RepoItem,
  usePathPattern,
  NavItem
} from '@components/shared';
import { useProject } from '@libs/hooks/container/organization';
import { ArgumentTypes } from '@types';
import { CSSProperties, useCallback, useMemo } from 'react';
import { Route, Routes } from 'react-router-dom';
import { HeaderFields } from '../entity/entity-wrapper';
import TabItem from '../entity/tab-item';
import {
  AddUserOrg,
  CreateOrgRepo, CreateProject, ModifyOrganization
} from './forms';
import MemberListItem from './member-list-item';
import { orgData, ORG_PERMISSION } from './permissions-data';
import ProjectList, { HeaderElements } from './project-list';
import ProjectListItem from './project-list-item';

type RoutesType<T> = {
  headerElements?: HeaderElements;
  navItems?: NavItem[];
  path: string;
  items: T[];
  navTitle:string;
  placeholder:string;
  fieldsToSearch: (keyof T)[];
  createEntity?: () => void;
  itemComponent: (searchText:string) => (item: T) => JSX.Element;
};

function Projects() {
  const {
    orgName,
    org,
    page,
    path,
    type,
    pkey,
    projects,
    repos,
    members,
    yourPermissions,
    navigate,
    goBack,
    addMemberToOrg
  } = useProject();

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

  const projectListItem = (searchText:string) => function (item: typeof projects[number]) {
    return (
      <ProjectListItem
        item={item}
        path={path}
        searchText={searchText}
        type={type}
      />
    );
  };

  const repoListItem = (searchText:string) => function (item: typeof repos[number]) {
    return (
      <RepoItem
        item={item}
        path={path}
        searchText={searchText}
        deleteRepo={() => { }}
      />
    );
  };

  const memberListItem = (searchText:string) => function (item: typeof members[number]) {
    return (
      <MemberListItem
        item={item}
        data={orgData}
        path={path}
        searchText={searchText}
      />
    );
  };

  const routes: RoutesType<any>[] = [
    {
      path: 'projects',
      items: projects,
      navTitle: 'Projects',
      placeholder: 'enter project name or id',
      headerElements: {
        placeholder: 'Search by project name or ID'
      },
      navItems: [
        {
          key: 'all',
          to: `${path}projects/${orgName}/projects?type=all&page=1`,
          text: 'All Projects'
        },
        {
          key: 'my',
          to: `${path}projects/${orgName}/projects?type=my&page=1`,
          text: 'My Projects'
        }
      ],
      fieldsToSearch: ['project_name', 'project_id'],
      itemComponent: projectListItem,
      createEntity: yourPermissions?.[ORG_PERMISSION.ADD_PRODECTS]
        ? () => navigate('create-project') : undefined
    },
    {
      path: 'repos',
      items: repos,
      navTitle: 'Repositories',
      placeholder: 'enter repo name or id',
      headerElements: {
        placeholder: 'Search by repo name or ID'
      },
      navItems: [
        {
          key: 'all',
          to: `${path}projects/${orgName}/repos?type=all&page=1`,
          text: 'All Repositories'
        },
        {
          key: 'my',
          to: `${path}projects/${orgName}/repos?type=my&page=1`,
          text: 'My Repositories'
        }
      ],
      fieldsToSearch: ['repo_id', 'repo_name'],
      itemComponent: repoListItem,
      createEntity: () => navigate('create-repo')
    },
    {
      path: 'users',
      items: members,
      navTitle: 'Projects',
      placeholder: 'enter user name',
      headerElements: {
        placeholder: 'Search by username of pid'
      },
      fieldsToSearch: ['member'],
      itemComponent: memberListItem,
      createEntity: yourPermissions?.[ORG_PERMISSION.ADD_MEMBER]
        ? () => navigate('add-user') : undefined
    }
  ];

  const currentRoute = usePathPattern(routes.map((el) => el.path));

  const headerFields:HeaderFields = {
    pkey,
    owner: org.organization_creator,
    routes: routes.map((el) => el.path),
    yourPermissions,
    avatar: {
      name: `${org.organization_name}${org.organization_creator}`,
      ipfs: org.organization_logo_ipfs_hash,
      variant: 'ring',
      square: false
    },
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
            isShowNav={pkey === org.organization_creator}
            id={orgName}
            pkey={pkey}
            path={path}
            page={page}
            type={type}
            placeholder={el.placeholder}
            route={el.path}
            projects={el.items}
            header={el.headerElements}
            navItems={el.navItems}
            fieldsToSearch={el.fieldsToSearch}
            listItem={el.itemComponent}
            createEntity={el.createEntity}
          />
        )}
      />
    )
  ), [projects, members, repos, currentRoute, routes]);

  const addUserMember = useCallback((obj: ArgumentTypes<typeof addMemberToOrg>[0]) => {
    addMemberToOrg(obj);
  }, []);

  return (
    <>
      {backButton}
      <Routes>
        <Route
          path="/edit"
          element={(
            <ModifyOrganization
              item={org}
              pkey={pkey}
              goBack={goBack}
            />
          )}
        />
        <Route
          path="/create-project"
          element={(
            <CreateProject
              pkey={pkey}
              orgName={org.organization_name}
              goBack={goBack}
            />
          )}
        />
        <Route
          path="/create-repo"
          element={(
            <CreateOrgRepo
              goBack={goBack}
              projects={projects}
            />
          )}
        />
        <Route
          path="/add-user"
          element={(
            <AddUserOrg
              data={orgData}
              oldName={org.organization_name}
              goBack={goBack}
              callback={addUserMember as (obj: unknown) => void}
            />
          )}
        />
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
