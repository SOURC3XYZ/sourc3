export interface IProfilesGit {
  id: number,
  login: string,
  node_id: string,
  name: string,
  avatar_url: string,
  blog_url: string,
  company: string,
  location: string,
  email: string,
  hireable: string,
  bio: string,
  twitter_username: string,
  public_repos: number,
  followers: number,
  following: number,
  mutual_followers: number,
  created_at: string,
  updated_at: string,
  user: number,
  added_lines_cnt: number,
  user_commits_cnt: number,
  removed_lines_cnt: number
}
export interface IGitOrgs {
  id: number,
  login: string,
  node_id: string,
  name: string,
  avatar_url: string,
  description: string
  users: []
}

export type ReposGitHubData = {
  full_name: string,
  commits_cnt: number,
  added_lines_cnt: number,
  last_commit_time: string,
  first_commit_time: string,
  removed_lines_cnt: number
};

export type LangGitData = {
  added_lines_cnt:number;
  commits_cnt:number;
  first_commit_time: string;
  last_commit_time: string;
  removed_lines_cnt: number;
  repos: ReposGitHubData[]
};

export interface IAchievements {
  id: number,
  type: string,
  data: LangGitData | {},
  created_at: string,
  updated_at: string,
  user: number
}
export interface IProfiles {
  id: string,
  github_login: string,
  login: string,
  created_at: string,
  updated_at: string,
  token: string,
  github_profile: IProfilesGit,
  github_orgs: IGitOrgs[],
  github_repos : IGitRepos[],
  achievements: IAchievements[],
  eth_address: string
}

export interface ILanguages {
  language: string,
  languages: [],
  added_lines_cnt: number,
  removed_lines_cnt: number,
  renamed_files_cnt: number,
  sum:number,
}

export interface IGitRepos {
  id: string,
  node_id: string,
  full_name: string,
  private: boolean,
  visibility: string,
  fork: boolean,
  description: string,
  ssh_url: string,
  clone_url: string,
  homepage: string,
  size: number,
  stargazers_count: number,
  watchers_count: number,
  language: string,
  has_issues: boolean,
  has_projects: boolean,
  has_downloads: boolean,
  has_wiki: boolean,
  has_pages: boolean,
  forks_count: number,
  mirror_url: string,
  open_issues_count: number,
  allow_forking: boolean,
  is_template: boolean,
  open_issues: number,
  default_branch: string,
  archived: boolean,
  disabled: boolean,
  pushed_at: string,
  created_at: string,
  updated_at: string,
  owner: number,
  user_commits_cnt: number,
  total_commits_cnt: number,
  parent:string,
  parent_stargazers_count: string,
  user_total_prs_cnt: number,
  user_pending_prs_cnt: number,
  user_accepted_prs_cnt: number,
  user_rejected_prs_cnt: number,
  total_releases_cnt: number,
  user_releases_cnt: number,
  user_first_commit_time: string,
  user_last_commit_time: string,
  user_first_pr_time: string,
  user_last_pr_time: string,
  user_languages: [ILanguages],
  user_committers_pos:number,
  total_committers_cnt: number,
  github_created_at: string,
  github_updated_at: string,
  rate: number,
  owner_login: string,
  rating: number,
  topics: [],
}
