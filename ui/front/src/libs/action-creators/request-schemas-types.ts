export type RepoReqType = {
  repo_name:string,
  project_name:string,
  organization_name:string
};

export type RepoObjIdType = RepoReqType & { obj_id: string };
