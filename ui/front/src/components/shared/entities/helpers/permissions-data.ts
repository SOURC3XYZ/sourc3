export enum ORG_PERMISSION {
  ADD_PRODECTS,
  ADD_MEMBER,
  REMOVE_PROJECT,
  REMOVE_MEMBER,
  MODIFY_MEMBER,
  MODIFY_ORG
}

export enum PROJECT_PERMISSION {
  ADD_REPO,
  ADD_MEMBER,
  REMOVE_REPO,
  REMOVE_MEMBER,
  MODIFY_MEMBER,
  MODIFY_PROJECT
}

export enum REPO_PERMISSION {
  MODIFY_REPO,
  ADD_MEMBER,
  REMOVE_MEMBER,
  PUSH,
  MODIFY_MEMBER
}

export const orgData = new Set<string>()
  .add('Add Projects')
  .add('Add Member')
  .add('Remove Project')
  .add('Remove Member')
  .add('Modify Member')
  .add('Modify Organization');

export const projectData = new Set<string>()
  .add('Add Repo')
  .add('Add Member')
  .add('Remove Repo')
  .add('Remove Member')
  .add('Modify Member')
  .add('Modify Project');

export const repoData = new Set<string>()
  .add('Modify Repo')
  .add('Add Member')
  .add('Remove Member')
  .add('Push')
  .add('Modify Member');
