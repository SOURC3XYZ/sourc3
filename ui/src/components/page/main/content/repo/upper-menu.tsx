import { BranchSelect, CommitsSelect, RepoMeta } from '@components/shared';
import { BranchCommit, BranchName, UpdateProps } from '@types';
import { Button, Col, Row } from 'antd';
import React from 'react';
import { useNavigate } from 'react-router-dom';

type UpperMenuProps = {
  repoMap: Map<BranchName, BranchCommit[]>;
  repoName: string;
  updateTree: (props: Omit<UpdateProps, 'id'>) => void;
  killTree: () => void;
};

const commitDataSetter = (
  commits: BranchCommit[], index?: number
): BranchCommit => {
  const isValidIndex = typeof index === 'number' && commits[index];
  if (isValidIndex) return commits[index] as BranchCommit;
  return commits[commits.length - 1];
};

const UpperMenu = ({
  repoMap, repoName, updateTree, killTree
}: UpperMenuProps) => {
  const navigate = useNavigate();
  const keys:BranchName[] = React.useMemo(() => Array.from(repoMap.keys()), []);
  const [branch, setBranch] = React.useState(keys[repoMap.size - 1]);
  const commits = repoMap.get(branch) as BranchCommit[];
  const [commitData, setCommitData] = React.useState(
    commits[commits.length - 1]
  );

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
      <Row align="middle">
        <Button onClick={() => navigate(-1)} type="link">Return</Button>

        <Col span={8}>
          <BranchSelect keys={keys} value={branch} selectHandler={setBranch} />
        </Col>

        <Col span={8}>
          <CommitsSelect
            value={commitData.tree_oid}
            keys={commits}
            updateTree={decoratedUpdateTree}
          />
        </Col>
      </Row>

      <Row>
        <Col span={24}>
          <RepoMeta name={repoName} commit={commitData} />
        </Col>
      </Row>
    </>
  );
};

export default UpperMenu;
