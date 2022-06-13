import { useCommitsTree } from '@libs/hooks/container/user-repos';
import {
  actualTime, dateCreator, getDateFromMs, getDay, getMsFromDays
} from '@libs/utils';
import {
  Branch,
  BranchCommit,
  DataNode,
  List,
  RepoId
} from '@types';
import Avatar from 'boring-avatars';
import { useCallback, useMemo } from 'react';
import { Preload } from '@components/shared/preload';
import { LoadingMessages } from '@libs/constants';
import { FailPage } from '@components/shared/fail-page';
import { Link } from 'react-router-dom';
import { ErrorBoundary, PreloadComponent } from '@components/hoc';
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

  const handleOnClick = (hash: string):React.MouseEventHandler<HTMLAnchorElement> => (e) => {
    e.preventDefault();
    goToCommit(hash);
  };

  const listRender = (sortedData: [number, BranchCommit[]][]) => sortedData.map((el) => {
    const [key, items] = el;
    return (
      <div key={key}>
        <h3 className={styles.dateHeader}>{getDateFromMs(getMsFromDays(key))}</h3>
        <List
          className={styles.list}
          bordered
          dataSource={items}
          renderItem={(item, index) => (
            <List.Item key={item.create_time_sec + index}>
              <List.Item.Meta
                avatar={(
                  <Avatar
                    size={40}
                    name={item.committer_email}
                    variant="beam"
                    colors={[
                      '#FF791F',
                      '#3FD05A',
                      '#000000',
                      '#C271B4',
                      '#4DA2E6',
                      '#DDDDDD',
                      '#92A1C6',
                      '#146A7C',
                      '#F0AB3D',
                      '#C271B4',
                      '#C20D90'
                    ]}
                  />
                )}
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
              <div>{`${dateCreator(actualTime(item))} ago`}</div>
            </List.Item>
          )}
        />
      </div>
    );
  });

  const data = useMemo(() => {
    if (repoMap) {
      const commits = repoMap.get(branchName);
      if (!commits) return null;
      const storage = new Map<number, BranchCommit[]>();
      commits.forEach((el) => {
        const key = getDay(actualTime(el));
        const time = storage.get(key);
        if (time) {
          time.push(el);
          return storage.set(key, time);
        }
        return storage.set(key, [el]);
      });
      return listRender(Array.from(storage.entries()));
    } return null;
  }, [repoMap, loading, branchName]);

  const fallback = (props:any) => {
    const updatedProps = { ...props, subTitle: 'no data' };
    return <FailPage {...updatedProps} isBtn />;
  };

  console.log(data);

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
          isLoaded={loading && !!data}
          Fallback={RefsPreloadFallback}
        >
          <div>{data}</div>

        </PreloadComponent>
      </ErrorBoundary>
    </>
  );
}

export default CommitsTree;
