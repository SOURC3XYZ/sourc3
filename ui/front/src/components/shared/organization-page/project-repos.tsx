/* eslint-disable react/no-unstable-nested-components */
import { useProjectRepos } from '@libs/hooks/container/organization';
import {
  EntityWrapper,
  RepoItem,
  NavItem,
  usePathPattern,
  BackButton
} from '@components/shared';
import { Route, Routes } from 'react-router-dom';
import { useCallback, useMemo } from 'react';
import { ArgumentTypes } from '@types';
import ProjectList, { HeaderElements } from './project-list';
import MemberListItem from './member-list-item';
import TabItem from '../entity/tab-item';
import { HeaderFields } from '../entity/entity-wrapper';
import { AddUserOrg, CreateProjectRepo, ModifyProject } from './forms';
import { projectData, repoData, PROJECT_PERMISSION } from './permissions-data';

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

function ProjectRepos() {
  const {
    path,
    type,
    pkey,
    id,
    repos,
    page,
    members,
    project,
    yourPermissions,
    navigate,
    goBack,
    addMemberToProject
  } = useProjectRepos();

  const tabData = useMemo(() => [
    {
      id: 0,
      label: <TabItem title="Repositories" count={repos.length} />
    },
    {
      id: 1,
      label: <TabItem title="Members" count={members.length} />
    }
  ], [repos, members]);

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
        data={projectData}
        item={item}
        path={path}
        searchText={searchText}
      />
    );
  };

  const routes: RoutesType<any>[] = [
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
          to: `${path}project/${id}/repos?type=all&page=1`,
          text: 'All Repositories'
        },
        {
          key: 'my',
          to: `${path}project/${id}/repos?type=my&page=1`,
          text: 'My Repositories'
        }
      ],
      fieldsToSearch: ['repo_id', 'repo_name'],
      createEntity: yourPermissions?.[PROJECT_PERMISSION.ADD_REPO]
        ? () => navigate('create-repo') : undefined,
      itemComponent: repoListItem
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
      createEntity: yourPermissions?.[PROJECT_PERMISSION.ADD_MEMBER]
        ? () => navigate('add-member') : undefined,
      itemComponent: memberListItem
    }
  ];

  const currentRoute = usePathPattern(routes.map((el) => el.path));

  const headerFields:HeaderFields = {
    pkey,
    yourPermissions,
    owner: project.project_creator,
    routes: routes.map((el) => el.path),
    avatar: {
      ipfs: project.project_logo_ipfs_hash,
      name: `${project.project_id}${project.project_name}${project.project_creator}`,
      square: true,
      variant: 'pixel'
    },
    shortTitle: project.project_description,
    socialLinks: {
      website: project.project_website,
      twitter: project.project_twitter,
      instagram: project.project_twitter,
      telegram: project.project_telegram,
      linkedin: project.project_linkedin,
      discord: project.project_discord
    },
    tabData
  };

  const back = useCallback(() => navigate(-1), []);

  const isElectron = useMemo(() => {
    const ua = navigator.userAgent;
    return /SOURC3-DESKTOP/i.test(ua);
  }, []);

  const style:React.CSSProperties = {
    position: 'relative',
    left: '0',
    top: '-150px'
  };

  const RoutesView = useMemo(() => routes.map(
    (el) => (
      <Route
        key={el.path}
        path={`${el.path}`}
        element={(
          <ProjectList
            isShowNav={pkey === project.project_creator}
            id={id}
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
  ), [members, repos, currentRoute]);

  const addUserMember = useCallback((obj: ArgumentTypes<typeof addMemberToProject>[0]) => {
    addMemberToProject(obj);
  }, []);

  return (
    <>
      {isElectron ? <BackButton inlineStyles={style} onClick={back} /> : null}
      <Routes>
        <Route
          path="/edit"
          element={(
            <ModifyProject
              pkey={pkey}
              project={project}
              goBack={goBack}
            />
          )}
        />
        <Route
          path="/create-repo"
          element={(
            <CreateProjectRepo
              goBack={goBack}
              idProject={id}
            />
          )}
        />
        <Route
          path="/add-member"
          element={(
            <AddUserOrg
              data={projectData}
              id={id}
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
              title={project.project_name}
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

export default ProjectRepos;
