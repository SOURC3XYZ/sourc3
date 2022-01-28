import { ErrorBoundary } from '@components/hoc';
import { FailPage, FileText, FileTreeBlock } from '@components/shared';
import {
  BranchCommit, BranchName, DataNode, RepoId, UpdateProps
} from '@types';
import React from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
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

const commitDataSetter = (
  commits: BranchCommit[], index?: number
): BranchCommit => {
  const isValidIndex = typeof index === 'number' && commits[index];
  if (isValidIndex) return commits[index] as BranchCommit;
  return commits[commits.length - 1];
};

const RepoContent = ({
  id,
  repoMap,
  repoName,
  fileText,
  tree,
  prevReposHref,
  updateTree,
  killTree,
  getFileData
}: UpperMenuProps) => {
  const navigate = useNavigate();
  const keys:BranchName[] = React.useMemo(() => Array.from(repoMap.keys()), []);
  const [branch, setBranch] = React.useState(keys[repoMap.size - 1]);

  const commits = repoMap.get(branch) || [] as BranchCommit[];

  const [commitData, setCommitData] = React.useState(
    commits[commits.length - 1]
  );

  React.useEffect(() => {
    const splitted = branch.replace('refs/heads/', '');
    const repoParams = window.location.pathname
      .split('/')
      .slice(4)
      .filter((el) => el);
    if (!repoParams.length) {
      navigate(`tree/${splitted}/${commitData.commit_oid}`);
    }
  }, []);

  const decoratedUpdateTree = (props: Omit<UpdateProps, 'id'>) => {
    const index = commits.findIndex(
      (el) => el.tree_oid === props.oid
    );
    setCommitData(commitDataSetter(commits, index !== -1 ? index : undefined));
    killTree();
    updateTree(props);
  };

  const checkBranch = (branchFromUrl:string, commitFromUrl: string) => {
    const branchFullName = `refs/heads/${branchFromUrl}`;
    const findedBranch = repoMap.get(branchFullName);
    if (findedBranch) {
      const findedCommit = findedBranch
        .find((el) => el.commit_oid === commitFromUrl);
      if (branch !== branchFullName) {
        setBranch(branchFullName);
      }
      if (findedCommit) {
        setCommitData(findedCommit);
      }
    }
  }; // TODO: DANIK: redo the binding to the state binding to the routing

  return (
    <>
      <UpperMenu
        keys={keys}
        repoName={repoName}
        updateTree={decoratedUpdateTree}
        branch={branch}
        commitData={commitData}
        commits={commits}
        setBranch={setBranch}
        prevReposHref={prevReposHref}
      />
      <Routes>
        <Route
          path="tree/:branch/:commit/*"
          element={(
            <ErrorBoundary fallback={<FailPage subTitle="no data" />}>
              <FileTreeBlock
                id={id}
                tree={tree}
                updateTree={updateTree}
                checkBranch={checkBranch}
              />
            </ErrorBoundary>
          )}
        />

        <Route
          path="blob/:branch/:commit/*"
          element={(
            <ErrorBoundary fallback={<FailPage subTitle="no data" />}>
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
