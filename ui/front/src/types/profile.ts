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
  user: number
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
export interface IProfiles {
  id: string,
  login: string,
  created_at: string,
  updated_at: string,
  token: string,
  github_profile: IProfilesGit,
  github_orgs: [IGitOrgs],
  github_owned_repos: [IGitRepos]
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
  owner: number
}
