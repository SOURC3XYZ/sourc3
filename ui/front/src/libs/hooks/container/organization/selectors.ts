import { Organization, OwnerListType, Project } from '@types';

export const itemsFilter = (items: Organization[], type: OwnerListType, pkey?:string) => {
  if (pkey && type === 'my') return items.filter((el) => el.organization_creator === pkey);
  return items;
};

export const getProjectsByOrgId = (
  items: Project[],
  type: OwnerListType,
  orgId: number,
  pkey?:string
) => {
  const orgProjects = items.filter((el) => el.organization_id === orgId);
  if (items.length) { debugger; }
  if (pkey && type === 'my') {
    return items.filter((el) => el.project_creator === pkey);
  } return orgProjects;
};

export const getOrgName = (orgId: number, items: Organization[]) => items
  .find((el) => el.organization_id === orgId)?.organization_name;
