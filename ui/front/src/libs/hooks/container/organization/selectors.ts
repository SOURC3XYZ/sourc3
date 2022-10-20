import {
  Organization, OwnerListType, Project, RepoType
} from '@types';

export const itemsFilter = (items: Organization[], type: OwnerListType, pkey?:string) => {
  if (pkey && type === 'my') return items.filter((el) => el.organization_creator === pkey);
  return items;
};

export const getProjectsByOrgId = (
  orgName: string,
  items: Project[],
  type: OwnerListType,
  pkey?:string
) => {
  const orgProjects = items.filter((el) => el.organization_name === orgName);
  if (pkey && type === 'my') {
    return orgProjects.filter((el) => el.project_creator === pkey);
  } return orgProjects;
};

export const getOrg = (name: string, items: Organization[]) => items
  .find((el) => el.organization_name === name);

export const getProjectName = (projectName: string, items: Project[]) => items
  .find((el) => el.project_name === projectName);

export const getReposByProject = (
  projectName: string,
  items: RepoType[],
  type: OwnerListType,
  pkey?:string
) => {
  const repos = items.filter((el) => el.project_name === projectName);
  if (pkey && type === 'my') return repos.filter((el) => el.repo_owner === pkey);
  return repos;
};
