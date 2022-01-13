import {
  BranchSelect, BreadCrumbMenu, CommitsSelect, RepoMeta
} from '@components/shared';
import { BranchCommit, UpdateProps } from '@types';
import { Row, Col } from 'antd';

type UpperMenuProps = {
  repoName: string,
  keys: string[],
  branch: string,
  commitData: BranchCommit,
  commits: BranchCommit[],
  setBranch:React.Dispatch<string>,
  updateTree: (props: Omit<UpdateProps, 'id'>) => void
};

const UpperMenu = ({
  keys, branch, commitData, commits, setBranch, repoName, updateTree
}:UpperMenuProps) => {
  const { tree_oid } = commitData;
  return (
    <>
      <Row align="middle">
        <Col span={8}>
          <BranchSelect keys={keys} value={branch} selectHandler={setBranch} />
        </Col>

        <Col span={8}>
          <CommitsSelect
            value={tree_oid}
            keys={commits}
            updateTree={updateTree}
          />
        </Col>
      </Row>

      <Row>
        <Col span={24}>
          <RepoMeta name={repoName} commit={commitData} />
        </Col>
      </Row>
      <Row>
        <BreadCrumbMenu />
      </Row>
    </>
  );
};

export default UpperMenu;
