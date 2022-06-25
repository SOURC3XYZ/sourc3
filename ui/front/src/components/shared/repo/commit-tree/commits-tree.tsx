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
import {
  useCallback, useEffect, useMemo, useState
} from 'react';
import { Preload } from '@components/shared/preload';
import { LoadingMessages } from '@libs/constants';
import { FailPage } from '@components/shared/fail-page';
import { Link } from 'react-router-dom';
import { ErrorBoundary, PreloadComponent } from '@components/hoc';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Skeleton } from 'antd';
import styles from '../repo.module.scss';
import { UpperMenu } from '../repo-content/upper-menu';

const ITEMS_COUNT = 5;

export type UpperMenuProps = {
  id: RepoId;
  goTo: (path: string) => void;
  tree: DataNode[] | null;
  branches: Branch[];
  prevReposHref: string | null;
};

function CommitsTree({
  branches,
  goTo,
  prevReposHref
}: UpperMenuProps) {
  const {
    params,
    branchName,
    loading,
    commitsMap,
    repoMap,
    goToBranch,
    goToCommit
  } = useCommitsTree({ goTo });

  const RefsPreloadFallback = useCallback(() => (
    <Preload
      className={styles.preload}
      message={LoadingMessages.COMMIT_TREE}
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
                    variant="marble"
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

  const [data, setData] = useState<JSX.Element[]>([]);

  const commitsBlock = useMemo(() => {
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

  const loadMoreData = ():void => {
    if (commitsBlock && commitsBlock.length) {
      const { length } = data;
      if (!length) setTimeout(() => setData(commitsBlock.slice(0, ITEMS_COUNT)));
      else {
        setTimeout(() => setData(
          (prev) => [...prev, ...commitsBlock.slice(length, length + ITEMS_COUNT)]
        ));
      }
    }
  };

  useEffect(loadMoreData, [commitsBlock]);

  useEffect(() => setData([]), [branchName]);

  return (
    <>
      <UpperMenu
        commitsMap={commitsMap}
        baseUrl=""
        branch={branchName}
        params={params}
        prevReposHref={prevReposHref}
        branches={branches}
        goToBranch={goToBranch}
      />
      <ErrorBoundary fallback={fallback}>
        <PreloadComponent
          isLoaded={loading && !!data && !!commitsBlock}
          Fallback={RefsPreloadFallback}
        >
          {commitsBlock ? (
            <InfiniteScroll
              dataLength={data.length}
              next={loadMoreData}
              loader={<Skeleton avatar paragraph={{ rows: 1 }} active />}
              hasMore={data.length < commitsBlock.length}
            >
              {data}
            </InfiniteScroll>
          ) : null}

        </PreloadComponent>
      </ErrorBoundary>
    </>
  );
}

export default CommitsTree;
