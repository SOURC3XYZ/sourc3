import { clipString, setBranchAndCommit } from '@libs/utils';
import { BranchCommit } from '@types';
import { Row, Col } from 'antd';
import { NavigateFunction } from 'react-router-dom';
import {
  BranchSelect,
  BreadCrumbMenu,
  CommitsSelect,
  RepoMeta
} from './content';

type UpperMenuProps = {
  branch: string,
  baseUrl: string,
  repoMap: Map<string, BranchCommit[]>,
  pathname:string,
  commit: BranchCommit,
  prevReposHref: string | null,
  navigate:NavigateFunction
};

const UpperMenu = ({
  branch,
  commit,
  repoMap,
  pathname,
  prevReposHref,
  baseUrl,
  navigate
}:UpperMenuProps) => {
  const { commit_oid } = commit;
  const keys = Array.from(repoMap.keys());
  const commits = repoMap.get(branch) as BranchCommit[];

  const root = `${baseUrl}/${branch}/${commit.commit_oid}`;

  let treePath = clipString(pathname, root);
  treePath = pathname !== treePath ? treePath : '';

  const onChange = (
    selectedCommit:string, selectedBranch = branch
  ) => {
    const {
      branch: recBranch, commit: recCommit
    } = setBranchAndCommit(
      repoMap, selectedBranch, selectedCommit
    );
    navigate(`${baseUrl}/${recBranch}/${recCommit.commit_oid}${treePath}`);
  };

  return (
    <>
      <Row>
        <BreadCrumbMenu
          pathname={pathname}
          branch={branch}
          commit={commit_oid}
          baseUrl={baseUrl}
          prevReposHref={prevReposHref}
        />
      </Row>
      <Row align="middle" style={{ marginTop: '40px' }}>
        <Col span={7}>
          <BranchSelect
            keys={keys}
            value={branch}
            onChange={onChange}
            commit={commit_oid}
          />
        </Col>

        <Col span={8}>
          <CommitsSelect
            value={commit_oid}
            keys={commits}
            onChange={onChange}
          />
        </Col>
      </Row>

      <Row style={{ marginTop: '1rem' }}>
        <Col span={24}>
          <RepoMeta commit={commit} />
        </Col>
      </Row>
    </>
  );
};

export default UpperMenu;
