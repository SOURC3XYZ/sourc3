export type RepoType = {
  repo_name: string;
  repo_id: number;
};

export type ReposResponse = {
  repos: RepoType[]
};
