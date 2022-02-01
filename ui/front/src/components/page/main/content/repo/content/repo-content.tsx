import { ErrorBoundary } from '@components/hoc';
import { FailPage, FileText, FileTreeBlock } from '@components/shared';
import { setBranchAndCommit } from '@libs/utils';
import {
  BranchCommit, BranchName, DataNode, RepoId, UpdateProps
} from '@types';
import React from 'react';
import {
  Route, Routes, useLocation, useNavigate
} from 'react-router-dom';
import { UpperMenu } from './upper-menu';

export type UpperMenuProps = {
  id: RepoId;
  repoName: string;
  fileText: string | null;
  tree: DataNode[] | null;
  repoMap: Map<BranchName, BranchCommit[]>;
  prevReposHref: string | null;
  updateTree: (props: Omit<UpdateProps, 'id'>) => void;
  killTree: () => void;
  getFileData: (repoId: RepoId, oid: string) => void;
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

const setBranchCommit = (
  repoMap:Map<BranchName, BranchCommit[]>, tree:string
) => {
  const [branch, commit] = tree.split('/');
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

const RepoContent = ({
  id,
  repoMap,
  repoName,
  fileText,
  tree,
  prevReposHref,
  killTree,
  updateTree,
  getFileData
}: UpperMenuProps) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { baseUrl, params } = splitUrl(['tree', 'blob'], pathname);
  const { branch, commit } = setBranchCommit(repoMap, params);

  React.useEffect(() => {
    navigate(`tree/${branch}/${commit.commit_oid}`);
  }, []);

  React.useEffect(() => {
    if (tree) killTree();
    updateTree({ oid: commit.tree_oid });
  }, [commit]);

  const fallback = (props:any) => {
    const updatedProps = { ...props, subTitle: 'no data' };
    return <FailPage {...updatedProps} />;
  };

  return (
    <>
      <UpperMenu
        pathname={pathname}
        repoName={repoName}
        baseUrl={baseUrl}
        branch={branch}
        prevReposHref={prevReposHref}
        repoMap={repoMap}
        commit={commit}
        navigate={navigate}
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
                fileText={fileText}
                tree={tree}
                getFileData={getFileData}
                updateTree={updateTree}
              />
            </ErrorBoundary>
          )}
        />
      </Routes>
    </>
  );
};

export default RepoContent;
