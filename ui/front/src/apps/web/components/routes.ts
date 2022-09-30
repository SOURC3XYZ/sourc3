import {
  AllRepos, DownloadPage, FailPage, Organizations, ProjectRepos, Projects, Repo
} from '@components/shared';
import { CreateProjectWeb } from '@components/shared/add-org/content/create-project-web';
import { GitProfile } from '@components/shared/git-auth';

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
    path: 'projects/:orgId/:type/:page',
    element: Projects
  },
  {
    path: 'project/:projId/:type/:page',
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
    path: 'profile/:id',
    element: GitProfile
  },
  {
    path: '/*',
    element: FailPage
  }
];
