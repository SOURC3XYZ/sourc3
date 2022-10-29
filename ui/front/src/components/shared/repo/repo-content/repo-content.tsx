import { PreloadComponent } from '@components/hoc';
import { Preload } from '@components/shared/preload';
import { RepoReqType } from '@libs/action-creators';
import { LoadingMessages } from '@libs/constants';
import useRepoContent from '@libs/hooks/container/user-repos/useRepoContent';
import {
  Branch,
  DataNode,
  ErrorHandler,
  MetaHash,
  UpdateOmitProps
} from '@types';
import { Col, Row } from 'antd';
import { useCallback, useMemo } from 'react';
import { RepoMeta } from '../repo-meta';
import styles from '../repo.module.scss';
import { FileText } from './file-text';
import { FileTreeBlock } from './file-tree-block';
import { UpperMenu } from './upper-menu';

export type UpperMenuProps = {
  params: RepoReqType;
  goTo: (path: string) => void;
  tree: DataNode[] | null;
  branches: Branch[];
  filesMap: Map<MetaHash, string>;
  prevReposHref: string | null;
  updateTree: (
    props: UpdateOmitProps, errorHandler: ErrorHandler) => void;
  killTree: () => void;
  getFileData: (
    params:RepoReqType, oid: string, errorHandler: ErrorHandler) => void;
};

function RepoContent({
  params: reqParams,
  branches,
  tree,
  filesMap,
  prevReposHref,
  goTo,
  killTree,
  updateTree,
  getFileData
}: UpperMenuProps) {
  const {
    commit,
    type,
    isLoading,
    branchName,
    pathname,
    commitsMap,
    params,
    baseUrl,
    goToCommitTree,
    goToBranch
  } = useRepoContent(reqParams, branches, tree, goTo, updateTree, killTree);

  const content = useMemo(() => (
    type === 'blob'
      ? (
        <FileText
          repoParams={reqParams}
          tree={tree}
          pathname={pathname}
          filesMap={filesMap}
          params={params}
          getFileData={getFileData}
          updateTree={updateTree}
        />
      )
      : (
        <FileTreeBlock
          params={reqParams}
          pathname={pathname}
          tree={tree}
          updateTree={updateTree}
          pathArray={params}
        />
      )), [tree, pathname, type, params, filesMap]);

  const CommitPreloadFallback = useCallback(() => (
    <Preload
      className={styles.preload}
      message={LoadingMessages.BRANCHES}
    />
  ), []);

  return (
    <>
      <UpperMenu
        commitsMap={commitsMap}
        baseUrl={baseUrl}
        branch={branchName}
        params={params}
        prevReposHref={prevReposHref}
        branches={branches}
        goToCommitTree={goToCommitTree}
        goToBranch={goToBranch}
      />
      <PreloadComponent
        isLoaded={!isLoading}
        Fallback={CommitPreloadFallback}
      >
        <>
          <Row style={{ marginTop: '10px' }}>
            <Col span={24}>
              <RepoMeta commit={commit as NonNullable<typeof commit>} />
            </Col>
          </Row>

          {content}
        </>
      </PreloadComponent>
    </>
  );
}

export default RepoContent;
