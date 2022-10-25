import {
  AllRepos, DownloadPage, FailPage, OrganizationPage, Organizations, ProfilesPage, ProjectPage, Repo
} from '@components/shared';
import { CreateProjectWeb } from '@components/shared/add-org/content/create-project-web';
import { ROUTES } from '@libs/constants';
import ProfilesEdit from '@components/shared/profiles-page/profiles-edit';

const {
  REPOS, REPO, ORG_LIST, ORG, PROJECT, DOWNLOAD, ADD_WEB, DEFAULT
} = ROUTES;

export const routesData = [
  {
    path: `${REPOS}/:type/:page`,
    element: AllRepos
  },
  {
    path: `${REPO}/:repoParams/*`,
    element: Repo
  },
  {
    path: `${ORG_LIST}/:type/:page`,
    element: Organizations
  },
  {
    path: `${ORG}/:orgName/*`,
    element: OrganizationPage
  },
  {
    path: `${PROJECT}/:projectName/*`,
    element: ProjectPage
  },
  {
    path: DOWNLOAD,
    element: DownloadPage
  },
  {
    path: ADD_WEB,
    element: CreateProjectWeb
  },
  {
    path: DEFAULT,
    element: FailPage
  },
  {
    path: 'profiles/:id/*',
    element: ProfilesPage
  },
  {
    path: 'profiles/:id/edit',
    element: ProfilesEdit
  }
];

// {
//   path: '/',
//   element: <Navigate replace to="/repos/all/1" />
// },
// {
//   path: 'repos/:type/:page',
//   element: <AllRepos />
// },
// {
//   path: 'repo/:repoParams/*',
//   element: <Repo />
// },

// {
//   path: 'organizations/:type/:page',
//   element: <Organizations />
// },
// {
//   path: 'projects/:orgName/*',
//   element: <Projects />
// },
// {
//   path: 'project/:projectName/*',
//   element: <ProjectRepos />
// },
// {
//   path: 'manager',
//   element: <Manager isDesk />
// },
// {
//   path: 'localRepos/',
//   element: <LocalRepos />
// },
// {
//   path: 'profiles/:id/*',
//   element: <ProfilesPage />
// },
// {
//   path: 'profiles/:id/edit',
//   element: <ProfilesEdit />
// }
