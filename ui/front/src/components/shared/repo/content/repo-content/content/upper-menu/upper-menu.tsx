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
  branch: string,
  baseUrl: string,
  branches: Branch[],
  params: string[],
  goToBranch: (name: string) => void
  commit: BranchCommit | null,
  prevReposHref: string | null,
};

const selectBranchOptionMap = (el: Branch, i:number) => (
  <Select.Option
    value={clipString(el.name)}
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
  params,
  goToBranch,
  branch,
  commit,
  prevReposHref,
  baseUrl
}:UpperMenuProps) {
  const root = baseUrl;

  const breadcrumbs = useMemo(() => (
    root ? (
      <BreadCrumbMenu
        root={root}
        params={params}
        prevReposHref={prevReposHref}
      />
    )
      : null), [params]);

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
            defaultValue={branch}
            className={styles.branch}
            value={branch}
            onChange={goToBranch}
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
