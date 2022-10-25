import { ROUTES } from '@libs/constants';
import { Project, RepoType } from '@types';

export const orgLink = (name: string) => [{ name, path: '' }];

export const projectLinks = (projects: Project[], name: string) => {
  const orgname = projects.find((el) => el.project_name === name);
  if (orgname) {
    return [
      {
        name: orgname.organization_name,
        path: `/${ROUTES.ORG}/${orgname.organization_name}/projects?type=all`
      },
      { name, path: '' }
    ];
  } return null;
};

export const reposLinks = (repos: RepoType[], name:string) => {
  const repoParams = repos.find((el) => el.repo_name === name);
  if (repoParams) {
    return [
      { name: repoParams.project_name, path: '' },
      { name: repoParams.repo_name, path: '' },
      { name, path: '' }
    ];
  } return null;
};
