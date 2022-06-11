import useRepoContent from '@libs/hooks/container/user-repos/useRepoContent';
import {
  Branch,
  DataNode,
  ErrorHandler,
  MetaHash, RepoId,
  UpdateProps
} from '@types';
import { useMemo } from 'react';
import { FileText, FileTreeBlock, UpperMenu } from './content';

export type UpperMenuProps = {
  id: RepoId;
  goTo: (path: string) => void;
  tree: DataNode[] | null;
  branches: Branch[];
  filesMap: Map<MetaHash, string>;
  prevReposHref: string | null;
  updateTree: (
    props: Omit<UpdateProps, 'id'>, errorHandler: ErrorHandler) => void;
  killTree: () => void;
  getFileData: (
    repoId: RepoId, oid: string, errorHandler: ErrorHandler) => void;
};

const splitUrl = (branch: string, fullUrl: string) => {
  const [baseUrl, params] = fullUrl.split(branch);
  return {
    baseUrl: `${baseUrl}${branch}`,
    params: params.split('/').filter((el) => el)
  };
};

// const setBranchCommit = (repoMap:Map<BranchName, BranchCommit[]>, tree:string) => {
//   const [branch, commit] = tree.split('/');
//   if (branch && commit) {
//     return setBranchAndCommit(repoMap, branch, commit);
//   }
//   const masterBranch = Array.from(repoMap.keys())[0];
//   const masterCommits = repoMap.get(masterBranch) as BranchCommit[];
//   const lastCommit = masterCommits[masterCommits.length - 1];
//   return {
//     branch: masterBranch,
//     commit: lastCommit
//   };
// };

function RepoContent({
  id,
  branches,
  goTo,
  tree,
  filesMap,
  prevReposHref,
  killTree,
  updateTree,
  getFileData
}: UpperMenuProps) {
  const {
    commit,
    type,
    branchName,
    pathname,
    goToBranch
  } = useRepoContent(id, branches, tree, goTo, updateTree, killTree);

  const { baseUrl, params } = splitUrl(branchName, pathname);

  const content = useMemo(() => (type === 'blob'
    ? (
      <FileText
        id={id}
        tree={tree}
        pathname={pathname}
        filesMap={filesMap}
        pathArray={params}
        getFileData={getFileData}
        updateTree={updateTree}
      />
    )
    : (
      <FileTreeBlock
        id={id}
        pathname={pathname}
        tree={tree}
        updateTree={updateTree}
        pathArray={params}
      />
    )), [params, type]);

  return (
    <>
      <UpperMenu
        baseUrl={baseUrl}
        branch={branchName}
        params={params}
        prevReposHref={prevReposHref}
        commit={commit}
        branches={branches}
        goToBranch={goToBranch}
      />
      {content}
    </>
  );
}

export default RepoContent;
