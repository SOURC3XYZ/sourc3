import useRepoContent from '@libs/hooks/container/user-repos/useRepoContent';
import { useAsyncError } from '@libs/hooks/shared';
import { clipString } from '@libs/utils';
import {
  Branch,
  DataNode,
  ErrorHandler,
  MetaHash, RepoId,
  UpdateProps
} from '@types';
import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
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

const splitUrl = (type: 'blob' | 'tree', fullUrl: string) => {
  const currentRoute = fullUrl.split(type)[1] as string;
  const params = fullUrl.split(currentRoute);
  return {
    baseUrl: `${params[0]}${currentRoute}`,
    params: params[1]?.substring(1)
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

  const { baseUrl } = splitUrl(type, pathname);
  const splitted = pathname.split('/');

  const pathArray = commit && splitted.slice(splitted.indexOf(branchName) + 1);

  const content = useMemo(() => {
    if (pathArray) {
      return type === 'blob'
        ? (
          <FileText
            id={id}
            tree={tree}
            pathname={pathname}
            filesMap={filesMap}
            pathArray={pathArray}
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
            pathArray={pathArray}
          />
        );
    } return null;
  }, [pathArray, type]);

  return (
    <>
      <UpperMenu
        pathname={pathname}
        baseUrl={baseUrl}
        branch={branchName}
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
