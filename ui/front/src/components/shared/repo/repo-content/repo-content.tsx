import { PreloadComponent } from '@components/hoc';
import { Preload } from '@components/shared/preload';
import { LoadingMessages } from '@libs/constants';
import useRepoContent from '@libs/hooks/container/user-repos/useRepoContent';
import {
  Branch,
  DataNode,
  ErrorHandler,
  MetaHash, RepoId,
  UpdateProps
} from '@types';
import { Col, Row } from 'antd';
import { useCallback, useMemo } from 'react';
import { RepoMeta } from '../repo-meta';
import { FileText } from './file-text';
import { FileTreeBlock } from './file-tree-block';
import { UpperMenu } from './upper-menu';
import styles from '../repo.module.scss';

export type UpperMenuProps = {
  id: RepoId;
  goTo: (path: string) => void;
  tree: DataNode[] | null;
  branches: Branch[];
  filesMap: Map<MetaHash, string>;
  prevReposHref: string | null;
  updateTree: (
    props: Omit<UpdateProps, 'id'>, errorHandler: ErrorHandler) => void;
  killTree: () => void;
  getFileData: (
    repoId: RepoId, oid: string, errorHandler: ErrorHandler) => void;
};

function RepoContent({
  id,
  branches,
  goTo,
  tree,
  filesMap,
  prevReposHref,
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
  } = useRepoContent(id, branches, tree, goTo, updateTree, killTree);

  const content = useMemo(() => (
    type === 'blob'
      ? (
        <FileText
          id={id}
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
          id={id}
          pathname={pathname}
          tree={tree}
          updateTree={updateTree}
          pathArray={params}
        />
      )), [tree, pathname, type, params]);

  const CommitPreloadFallback = useCallback(() => (
    <Preload
      className={styles.preload}
      message={LoadingMessages.COMMIT}
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
