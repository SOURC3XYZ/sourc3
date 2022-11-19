export type RepoReqType = {
  repo_name:string,
  project_name:string,
  organization_name:string
};

export type RepoObjIdType = RepoReqType & { obj_id: string };

export type ModifyProject = {
  name: string;
  logo_addr:string;
  old_name:string;
  short_title: string;
  website:string;
  twitter:string;
  linkedin:string;
  instagram:string;
  telegram:string;
  discord: string;
  pid?:number;
};
