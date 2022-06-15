import { PreloadComponent } from '@components/hoc';
import { Preload } from '@components/shared/preload';
import { LoadingMessages } from '@libs/constants';
import { useCommit } from '@libs/hooks/container/user-repos';
import {
  RepoId, MetaHash, UpdateProps, ErrorHandler, Branch
} from '@types';
import { Col, Row } from 'antd';
import { DataNode } from 'antd/lib/tree';
import { useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FileText } from '../repo-content/file-text';
import { FileTreeBlock } from '../repo-content/file-tree-block';
import { BreadCrumbMenu } from '../repo-content/upper-menu/breadcrumb';
import { RepoMeta } from '../repo-meta';
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

function CommitContent({
  id, branches, tree, filesMap, prevReposHref, getFileData, goTo, updateTree, killTree
}:UpperMenuProps) {
  const {
    commit,
    type,
    isLoading,
    pathname,
    params,
    baseUrl,
    commitsMap,
    goToCommitTree
  } = useCommit(id, branches, tree, goTo, updateTree, killTree);

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
          pathArray={params}
          updateTree={updateTree}
        />
      )), [tree, pathname, type, params, filesMap]);

  const CommitPreloadFallback = useCallback(() => (
    <Preload
      className={styles.preload}
      message={LoadingMessages.COMMIT}
    />
  ), []);

  const commits = useMemo(() => (
    commitsMap
      ? (
        <Link onClick={goToCommitTree} to="">
          {`${commitsMap.size} commits`}
        </Link>
      )
      : <div>Building commit tree...</div>
  ), [commitsMap]);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <BreadCrumbMenu
          root={baseUrl}
          params={params}
          prevReposHref={prevReposHref || '/repos/all/1'}
        />
        {commits}
      </div>

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

export default CommitContent;
