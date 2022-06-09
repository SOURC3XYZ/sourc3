import { ErrorBoundary } from '@components/hoc';
import { FailPage } from '@components/shared';
import useRepoContent from '@libs/hooks/container/user-repos/useRepoContent';
import { useAsyncError } from '@libs/hooks/shared';
import { clipString, setBranchAndCommit } from '@libs/utils';
import {
  Branch,
  BranchCommit,
  BranchName,
  DataNode,
  ErrorHandler,
  MetaHash, RepoId,
  UpdateProps
} from '@types';
import { useEffect } from 'react';
import {
  Route, Routes, useLocation, useNavigate
} from 'react-router-dom';
import { FileText, FileTreeBlock, UpperMenu } from './content';

export type UpperMenuProps = {
  id: RepoId;
  repoName: string;
  tree: DataNode[] | null;
  branches: Branch[];
  // repoMap: Map<BranchName, BranchCommit[]>;
  filesMap: Map<MetaHash, string>;
  prevReposHref: string | null;
  updateTree: (
    props: Omit<UpdateProps, 'id'>, errorHandler: ErrorHandler) => void;
  killTree: () => void;
  getFileData: (
    repoId: RepoId, oid: string, errorHandler: ErrorHandler) => void;
};

const splitUrl = (routes: string[], fullUrl: string) => {
  const currentRoute = routes.find(
    (route) => fullUrl.split(route)[1]
  ) as string;
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

const setBranchCommit = (branches: Branch[], params:string) => {
  const [branch, commit] = params.split('/');
  if (branch && commit) {
    return setBranchAndCommit(repoMap, branch, commit);
  }
  const masterBranch = Array.from(repoMap.keys())[0];
  const masterCommits = repoMap.get(masterBranch) as BranchCommit[];
  const lastCommit = masterCommits[masterCommits.length - 1];
  return {
    branch: masterBranch,
    commit: lastCommit
  };
};

function RepoContent({
  id,
  branches,
  // repoMap,
  filesMap,
  tree,
  prevReposHref,
  killTree,
  updateTree,
  getFileData
}: UpperMenuProps) {
  const setError = useAsyncError();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const {
    branch,
    commit,
    loading,
    err,
    setBranch
  } = useRepoContent(id, branches);
  const { baseUrl, params } = splitUrl(['tree', 'blob'], pathname);
  // const { branch, commit } = setBranchCommit(branches, params);
  const splitted = pathname.split('/');

  const pathArray = commit && splitted.slice(splitted.indexOf(commit.commit_oid) + 1);

  useEffect(() => {
    // if (repoMap === null) setError(new Error('no data'));
    if (commit) navigate(`tree/${clipString(branch.name)}/${commit.commit_oid}`);
  }, [commit]);

  useEffect(() => {
    if (tree) killTree();
    if (commit) updateTree({ oid: commit.tree_oid }, setError);
  }, [pathname]);

  const fallback = (props:any) => {
    const updatedProps = { ...props, subTitle: props.message || 'no data' };
    return <FailPage {...updatedProps} />;
  };

  return (
    <>
      <UpperMenu
        pathname={pathname}
        baseUrl={baseUrl}
        branch={branch}
        prevReposHref={prevReposHref}
        commit={commit}
        branches={branches}
        setBranch={setBranch}
      />
      <Routes>
        <Route
          path="tree/:branch/:commit/*"
          element={(
            <ErrorBoundary fallback={fallback}>
              <FileTreeBlock
                id={id}
                pathname={pathname}
                tree={tree}
                updateTree={updateTree}
                pathArray={pathArray}
                // time={commit.create_time_sec}
              />
            </ErrorBoundary>
          )}
        />

        <Route
          path="blob/:branch/:commit/*"
          element={(
            <ErrorBoundary fallback={fallback}>
              <FileText
                id={id}
                filesMap={filesMap}
                tree={tree}
                pathname={pathname}
                pathArray={pathArray}
                getFileData={getFileData}
                updateTree={updateTree}
              />
            </ErrorBoundary>
          )}
        />
      </Routes>
    </>
  );
}

export default RepoContent;
