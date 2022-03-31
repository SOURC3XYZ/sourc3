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

export interface IDataNodeCustom extends DataNode{
  dataRef: TreeElement
}

export type UpdateProps = {
  id: RepoId,
  oid: TreeOid,
  index?:number,
  key?: React.Key,
  resolve?: () => void
};

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
