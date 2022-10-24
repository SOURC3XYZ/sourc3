import {
  AllRepos, DownloadPage, FailPage, Organizations, ProfilesPage, ProjectRepos, Projects, Repo
} from '@components/shared';
import { CreateProjectWeb } from '@components/shared/add-org/content/create-project-web';
import ProfilesEdit from '@components/shared/profiles-page/profiles-edit';

export const routesData = [
  {
    path: 'repos/:type/:page',
    element: AllRepos
  },
  {
    path: 'repo/:repoParams/*',
    element: Repo
  },
  {
    path: 'organizations/:type/:page',
    element: Organizations
  },
  {
    path: 'projects/:orgName/*',
    element: Projects
  },
  {
    path: 'project/:projectName/*',
    element: ProjectRepos
  },
  {
    path: 'download',
    element: DownloadPage
  },
  {
    path: 'add-web',
    element: CreateProjectWeb
  },
  {
    path: '/*',
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
