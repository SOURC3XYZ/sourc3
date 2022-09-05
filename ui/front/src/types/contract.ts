import { DataNode } from './antd';

export interface ContractResp {
  error?: string
}

export type RepoName = string;
export type RepoId = number;
export type BranchName = string;
export type CommitHash = string;
export type MetaHash = string;
export type MetaObjectType = number;
export type MetaObjectSize = number;
export type TreeOid = string;
export type TreeElementFilename = string;
export type TreeElementOid = string;
export type ObjectData = string;
export type RepoListType = 'all' | 'my';
export type LocalRepoName = string | null;
export type LocalRepoBranch = string;
export type LocalRepoId = string | null;

export type BeamReqAction = { [key: string]: string };

export type RepoType = {
  repo_name: RepoName;
  repo_id: RepoId;
  repo_owner: string;
  project_id: number;
  cur_objects: number;
};

export interface ReposResp extends ContractResp {
  repos: RepoType[]
}

export type RepoMeta = {
  object_hash: MetaHash
  object_type: MetaObjectType
  object_size: MetaObjectSize
};

export interface RepoMetaResp extends ContractResp {
  objects: RepoMeta[]
}

export interface ContractsResp extends ContractResp {
  contracts: { cid: string, Height: number }[]
}

export interface CommitFromDataResp extends ContractResp {
  contracts: { cid: string, Height: number }[]
}

export interface DataResp extends ContractResp {
  object_data: string;
}

export interface PKeyRes extends ContractResp {
  key: string
}

export type Branch = {
  name: BranchName
  commit_hash: CommitHash
};

export interface RepoRefsResp extends ContractResp {
  refs: Branch[]
}

export type CommitData = {
  oid: CommitHash
};

export type BranchCommit = {
  commit_oid: CommitHash
  raw_header: string
  raw_message: string
  tree_oid: TreeOid
  author_name:string
  author_email:string
  committer_name:string
  committer_email:string
  object_data: string
  parents: CommitData[]
  commit_time_positive: number
  commit_time_sec: number
  commit_time_tz_offset_min: number
  create_time_positive: number
  create_time_sec: number
  create_time_tz_offset_min: number
};

export type User = { active: boolean, avatar: number, id: number, name: string };

export interface Member extends ContractResp {
  user_id:string;
  user_name:string;
  user_nickname:string;
  user_email:string;
  user_description:string;
  user_website:string;
  user_twitter:string;
  user_linkedin:string;
  user_instagram:string;
  user_telegram:string;
  user_discord:string;
  user_avatar_ipfs_hash:string;
}

export type MemberId = {
  member:string;
  permissions: number;
};

export interface RepoCommitResp extends ContractResp {
  commit: BranchCommit;
}

export type TreeElement = {
  filename: TreeElementFilename;
  attributes: number;
  oid: TreeElementOid
};

export interface RepoTreeResp extends ContractResp {
  tree: {
    entries_num: 6;
    object_data: string;
    entries: TreeElement[]
  }
}

export interface MemberList extends ContractResp {
  members: MemberId[]
}

export type Organization = {
  organization_tag: number,
  organization_id: number,
  organization_name: string,
  organization_creator: string,
  organization_short_title: string,
  organization_about: string,
  organization_website: string,
  organization_twitter: string,
  organization_linkedin: string,
  organization_instagram: string,
  organization_telegram: string,
  organization_discord: string,
  organization_logo_ipfs_hash: string
};

export interface OrganizationsResp extends ContractResp {
  organizations: Organization[]
}

export interface IDataNodeCustom extends DataNode {
  dataRef: TreeElement
}

export type UpdateProps = {
  id: RepoId,
  oid: TreeOid,
  index?:number,
  key?: React.Key,
  resolve?: () => void
};

export type Project = {
  project_tag:number;
  project_id:number;
  organization_id:number;
  project_name:string;
  project_creator:string;
  project_description:string,
  project_website:string,
  project_twitter:string,
  project_linkedin:string,
  project_instagram:string,
  project_telegram:string,
  project_discord:string,
  project_logo_ipfs_hash:string
};

export interface ProjectsResp extends ContractResp {
  projects : Project[]
}

export interface ObjectDataResp extends ContractResp {
  object_data: ObjectData
}

export type Commit = {
  object_hash: string
  object_type:number
  object_size:number
};

export type CommitListRes = {
  objects: Commit[]
};

export type Seed2ValidationType = {
  seed: string[];
  errors: boolean[]
};
