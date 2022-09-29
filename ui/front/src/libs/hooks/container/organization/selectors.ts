import {
  Organization, OwnerListType, Project, RepoType
} from '@types';

export const itemsFilter = (items: Organization[], type: OwnerListType, pkey?:string) => {
  if (pkey && type === 'my') return items.filter((el) => el.organization_creator === pkey);
  return items;
};

export const getProjectsByOrgId = (
  id: number,
  items: Project[],
  type: OwnerListType,
  pkey?:string
) => {
  const orgProjects = items.filter((el) => el.organization_id === id);
  if (pkey && type === 'my') {
    return orgProjects.filter((el) => el.project_creator === pkey);
  } return orgProjects;
};

export const getOrg = (orgId: number, items: Organization[]) => items
  .find((el) => el.organization_id === orgId);

export const getProjectName = (id: number, items: Project[]) => items
  .find((el) => el.project_id === id)?.project_name;

export const getReposByProject = (
  id: number,
  items: RepoType[],
  type: OwnerListType,
  pkey?:string
) => {
  const repos = items.filter((el) => el.project_id === id);
  if (pkey && type === 'my') return repos.filter((el) => el.repo_owner === pkey);
  return repos;
};

export const getReposByOrg = ((
  id: number,
  items: RepoType[],
  type: OwnerListType,
  pkey?:string
) => {
  const repos = items.filter((el) => el.project_id === id);
  if (pkey && type === 'my') return repos.filter((el) => el.repo_owner === pkey);
  return repos;
});
