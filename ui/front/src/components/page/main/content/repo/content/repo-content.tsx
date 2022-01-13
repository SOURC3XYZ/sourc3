import { FileText, FileTreeBlock } from '@components/shared';
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
  id, repoMap, repoName, fileText, tree, updateTree, killTree, getFileData
}: UpperMenuProps) => {
  const navigate = useNavigate();
  const keys:BranchName[] = React.useMemo(() => Array.from(repoMap.keys()), []);
  const [branch, setBranch] = React.useState(keys[repoMap.size - 1]);
  const commits = repoMap.get(branch) as BranchCommit[];
  const [commitData, setCommitData] = React.useState(
    commits[commits.length - 1]
  );

  React.useEffect(() => {
    const splitted = branch.split('/');
    navigate(`tree/${splitted[splitted.length - 1]}`);
  }, [branch]);

  const decoratedUpdateTree = (props: Omit<UpdateProps, 'id'>) => {
    const index = commits.findIndex(
      (el) => el.tree_oid === props.oid
    );
    setCommitData(commitDataSetter(commits, index !== -1 ? index : undefined));
    killTree();
    updateTree(props);
  };

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
      />
      <Routes>
        <Route
          path="tree/:branch/*"
          element={(
            <FileTreeBlock id={id} tree={tree} updateTree={updateTree} />
          )}
        />

        <Route
          path="blob/:branch/*"
          element={(
            <FileText
              id={id}
              fileText={fileText}
              tree={tree}
              getFileData={getFileData}
              updateTree={updateTree}
            />
          )}
        />
      </Routes>
    </>
  );
};

export default RepoContent;
