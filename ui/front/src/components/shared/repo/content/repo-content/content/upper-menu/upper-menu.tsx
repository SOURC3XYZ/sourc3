import { CustomAntdSelect } from '@components/shared/select';
import { clipString } from '@libs/utils';
import { Branch, BranchCommit } from '@types';
import { Row, Col, Select } from 'antd';
import { useMemo } from 'react';
import {
  BreadCrumbMenu,
  RepoMeta
  // RepoDescription
} from './content';
import styles from './upper-menu.module.scss';

type UpperMenuProps = {
  branch: Branch,
  baseUrl: string,
  branches: Branch[],
  setBranch: (branch: Branch) => void
  pathname:string,
  commit: BranchCommit | null,
  prevReposHref: string | null,
};

const selectBranchOptionMap = (el: Branch, i:number) => (
  <Select.Option
    value={el.name}
    key={`${el.name}-select-${i}`}
  >
    {clipString(el.name)}
  </Select.Option>
);

// const selectCommitOptionMap = (el: BranchCommit, i:number) => (
//   <Select.Option
//     value={el.commit_oid}
//     key={`${el.commit_oid}-select-${i}`}
//   >
//     {el.raw_message}
//   </Select.Option>
// );

function UpperMenu({
  branches,
  setBranch,
  branch,
  commit,
  pathname,
  prevReposHref,
  baseUrl
}:UpperMenuProps) {
  const root = commit && `${baseUrl}/${clipString(branch.name)}/${commit.commit_oid}`;

  const onBranchChange = (selectedBranch: string) => {
    const finded = branches.find((el) => el.name === selectedBranch);
    if (finded) setBranch(finded);
  };

  const breadcrumbs = useMemo(() => (root ? (
    <BreadCrumbMenu
      root={root}
      pathname={pathname}
      prevReposHref={prevReposHref}
    />
  )
    : null), [root]);

  const repoMeta = useMemo(() => (
    commit ? (
      <Col span={24}>
        <RepoMeta commit={commit} />
      </Col>
    )
      : null
  ), [commit]);

  return (
    <>
      <Row>{breadcrumbs}</Row>
      {/* <RepoDescription /> */}
      <Row align="middle" style={{ marginTop: '40px' }}>
        <Col span={7}>
          <CustomAntdSelect
            defaultValue={branch.name}
            className={styles.branch}
            value={branch.name}
            onChange={onBranchChange}
            title="Branch"
          >
            {branches.map(selectBranchOptionMap)}
          </CustomAntdSelect>
        </Col>

        {/* <Col span={8}>
          <CustomAntdSelect
            title="Commits"
            value={commit_oid}
            className={styles.commits}
            defaultValue={commits[commits.length - 1]?.commit_oid}
            onChange={onCommitChange}
          >
            {commits.map(selectCommitOptionMap)}
          </CustomAntdSelect>
        </Col> */}
      </Row>

      <Row style={{ marginTop: '1rem' }}>
        {repoMeta}
      </Row>
    </>
  );
}

export default UpperMenu;
