import { CustomAntdSelect } from '@components/shared/select';
import { clipString, setBranchAndCommit } from '@libs/utils';
import { BranchCommit } from '@types';
import { Row, Col, Select } from 'antd';
import { NavigateFunction } from 'react-router-dom';
import {
  BreadCrumbMenu,
  RepoMeta
} from './content';
import styles from './upper-menu.module.scss';

type UpperMenuProps = {
  branch: string,
  baseUrl: string,
  repoMap: Map<string, BranchCommit[]>,
  pathname:string,
  commit: BranchCommit,
  prevReposHref: string | null,
  navigate:NavigateFunction
};

const selectBranchOptionMap = (el: string, i:number) => (
  <Select.Option
    value={el}
    key={`${el}-select-${i}`}
  >
    {el}
  </Select.Option>
);

const selectCommitOptionMap = (el: BranchCommit) => (
  <Select.Option
    value={el.commit_oid}
    key={el.commit_oid}
  >
    {el.raw_message}
  </Select.Option>
);

function UpperMenu({
  branch,
  commit,
  repoMap,
  pathname,
  prevReposHref,
  baseUrl,
  navigate
}:UpperMenuProps) {
  const { commit_oid } = commit;
  const keys = Array.from(repoMap.keys());
  const commits = repoMap.get(branch) as BranchCommit[];

  const root = `${baseUrl}/${branch}/${commit.commit_oid}`;

  let treePath = clipString(pathname, root);
  treePath = pathname !== treePath ? treePath : '';

  const onChange = (selectedCommit:string, selectedBranch = branch) => {
    const {
      branch: recBranch, commit: recCommit
    } = setBranchAndCommit(repoMap, selectedBranch, selectedCommit);
    navigate(`${baseUrl}/${recBranch}/${recCommit.commit_oid}${treePath}`);
  };

  const onBranchChange = (selectedBranch: string) => onChange(commit_oid, selectedBranch);

  const onCommitChange = (selectedCommit:string) => onChange(selectedCommit);

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
          <CustomAntdSelect
            defaultValue={keys[keys.length - 1]}
            className={styles.branch}
            value={branch}
            onChange={onBranchChange}
            title="Branch"
          >
            {keys.map(selectBranchOptionMap)}
          </CustomAntdSelect>
        </Col>

        <Col span={8}>
          <CustomAntdSelect
            title="Commits"
            value={commit_oid}
            className={styles.commits}
            defaultValue={commits[commits.length - 1]?.commit_oid}
            onChange={onCommitChange}
          >
            {commits.map(selectCommitOptionMap)}
          </CustomAntdSelect>
        </Col>
      </Row>

      <Row style={{ marginTop: '1rem' }}>
        <Col span={24}>
          <RepoMeta commit={commit} />
        </Col>
      </Row>
    </>
  );
}

export default UpperMenu;
