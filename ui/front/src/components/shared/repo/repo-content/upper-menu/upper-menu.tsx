import { CustomAntdSelect } from '@components/shared/select';
import { clipString } from '@libs/utils';
import { Branch, BranchCommit } from '@types';
import { Row, Select } from 'antd';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BreadCrumbMenu } from './breadcrumb';
import styles from './upper-menu.module.scss';

type UpperMenuProps = {
  branch: string,
  baseUrl: string,
  branches: Branch[],
  params: string[],
  commitsMap: Map<string, BranchCommit> | null,
  prevReposHref: string | null,
  goToBranch: (name: string) => void;
  goToCommitTree?: (branch:string) => void;
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
  commitsMap,
  goToBranch,
  goToCommitTree,
  branch,
  prevReposHref,
  baseUrl
}:UpperMenuProps) {
  const breadcrumbs = useMemo(() => (
    baseUrl ? (
      <BreadCrumbMenu
        root={baseUrl}
        params={params}
        prevReposHref={prevReposHref || '/repos/all/1'}
      />
    )
      : null), [params]);

  const onCommitMapClickHandle:React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    e.preventDefault();
    if (goToCommitTree) goToCommitTree(branch);
  };

  const commits = useMemo(() => (
    commitsMap
      ? (
        <Link onClick={onCommitMapClickHandle} to="">
          {`${commitsMap.size} commits`}
        </Link>
      )
      : <div>Building commit tree...</div>
  ), [commitsMap]);

  return (
    <>
      <Row>{breadcrumbs}</Row>
      {/* <RepoDescription /> */}
      <Row align="middle" style={{ marginTop: '40px' }}>
        <div className={styles.branchAndCommits}>
          <div>
            <CustomAntdSelect
              defaultValue={branch}
              className={styles.branch}
              value={branch}
              onChange={goToBranch}
              title="Branch"
            >
              {branches.map(selectBranchOptionMap)}
            </CustomAntdSelect>
          </div>
          {commits}
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
        </div>
      </Row>
    </>
  );
}

export default UpperMenu;
