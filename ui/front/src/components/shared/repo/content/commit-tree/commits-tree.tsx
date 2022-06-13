import { useCommitsTree } from '@libs/hooks/container/user-repos';
import { dateCreator } from '@libs/utils';
import {
  Branch,
  DataNode,
  List,
  RepoId
} from '@types';
import { Avatar } from 'antd';
import img from '@assets/img/avatar-large.png';
import { useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import ErrorBoundary from 'antd/lib/alert/ErrorBoundary';
import { PreloadComponent } from '@components/hoc';
import { Preload } from '@components/shared/preload';
import { LoadingMessages } from '@libs/constants';
import { FailPage } from '@components/shared/fail-page';
import { UpperMenu } from '../repo-content/content';
import styles from '../../repo.module.scss';

export type UpperMenuProps = {
  id: RepoId;
  goTo: (path: string) => void;
  tree: DataNode[] | null;
  branches: Branch[];
  prevReposHref: string | null;
};

const splitUrl = (branch: string, fullUrl: string) => {
  const [baseUrl, params] = fullUrl.split(branch);
  return {
    baseUrl: `${baseUrl}${branch}`,
    params: params.split('/').filter((el) => el)
  };
};

function CommitsTree({
  branches,
  goTo,
  prevReposHref
}: UpperMenuProps) {
  const {
    pathname,
    branchName,
    loading,
    commitsMap,
    setError,
    repoMap,
    goToBranch,
    goToCommit
  } = useCommitsTree({ goTo });

  const { params } = splitUrl(`commits/${branchName}`, pathname);

  const RefsPreloadFallback = useCallback(() => (
    <Preload
      className={styles.preload}
      message={LoadingMessages.COMMITS}
    />
  ), []);

  const data = useMemo(() => {
    if (repoMap) {
      const commits = repoMap.get(branchName);
      if (!commits) return null;
      return commits;
    } return null;
  }, [repoMap, loading, branchName]);

  const fallback = (props:any) => {
    const updatedProps = { ...props, subTitle: 'no data' };
    return <FailPage {...updatedProps} isBtn />;
  };

  const handleOnClick = (hash: string):React.MouseEventHandler<HTMLAnchorElement> => (e) => {
    e.preventDefault();
    goToCommit(hash);
  };
  return (
    <>
      <UpperMenu
        commitsMap={commitsMap}
        baseUrl=""
        branch={branchName}
        params={params}
        prevReposHref={prevReposHref}
        commit={null}
        branches={branches}
        goToBranch={goToBranch}
      />
      <ErrorBoundary fallback={fallback}>
        <PreloadComponent
          isLoaded={loading}
          Fallback={RefsPreloadFallback}
        >
          <List
            dataSource={data as NonNullable<typeof data>}
            renderItem={(item, index) => (
              <List.Item key={item.create_time_sec + index}>
                <List.Item.Meta
                  avatar={<Avatar src={img} />}
                  title={(
                    <Link
                      onClick={handleOnClick(item.commit_oid)}
                      to=""
                    >
                      {item.raw_message}
                    </Link>
                  )}
                  description={item.author_name}
                />
                <div>{`${dateCreator(item.create_time_sec * 1000)} ago`}</div>
              </List.Item>
            )}
          />
        </PreloadComponent>
      </ErrorBoundary>
    </>
  );
}

export default CommitsTree;
