import {
  BranchSelect, BreadCrumbMenu, CommitsSelect, RepoMeta
} from '@components/shared';
import { clipString, setBranchAndCommit } from '@libs/utils';
import { BranchCommit } from '@types';
import { Row, Col } from 'antd';
import { NavigateFunction } from 'react-router-dom';

type UpperMenuProps = {
  repoName: string,
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
  repoName,
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
      <Row align="middle">
        <Col span={8}>
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

      <Row>
        <Col span={24}>
          <RepoMeta name={repoName} commit={commit} />
        </Col>
      </Row>
      <Row>
        <BreadCrumbMenu
          pathname={pathname}
          branch={branch}
          commit={commit_oid}
          baseUrl={baseUrl}
          prevReposHref={prevReposHref}
        />
      </Row>
    </>
  );
};

export default UpperMenu;
