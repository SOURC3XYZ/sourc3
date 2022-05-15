import { OwnerListType, RepoType } from '@types';
import { List } from 'antd';
import { PaginationConfig } from 'antd/lib/pagination';
import {
  useEffect, useMemo, useRef, useState
} from 'react';
import { useNavigate } from 'react-router-dom';
import { ListItem } from './content';
import styles from './repo-list.module.scss';

type ListRenderProps = {
  path: string,
  page: number,
  items: RepoType[],
  deleteRepos: (repo_id: number) => void
  type: OwnerListType;
  searchText: string;
  route?: string
};

function RepoList({
  page = 1, type = 'all', route = 'repos', items, searchText, path, deleteRepos
}:ListRenderProps) {
  const navigate = useNavigate();
  const textCash = useRef(searchText);

  const [pageSize, setPageSize] = useState(4);

  const onChange = (next:number) => navigate(`${path}${route}/${type}/${next}`);

  useEffect(() => {
    if (textCash.current !== searchText) {
      textCash.current = searchText;
      navigate(`${path}${route}/${type}/${1}`, { replace: true });
    }
  }, [searchText]);

  const onShowSizeChange = (current:number, size:number) => {
    if (current !== pageSize) setPageSize(size);
  };

  const pagination:PaginationConfig = {
    className: styles.pagination,
    size: 'small',
    current: page,
    pageSizeOptions: ['4', '8', '16', '32', '64', '128'],
    pageSize,
    onChange,
    onShowSizeChange
  };

  const paginationVisible = useMemo(() => !!items.length && pagination, [items, page, pageSize]);

  return (
    <List
      className={styles.list}
      bordered
      size="small"
      pagination={paginationVisible}
      dataSource={items}
      renderItem={(item) => (
        <ListItem
          item={item}
          path={path}
          searchText={searchText}
          deleteRepos={deleteRepos}
        />
      )}
    />
  );
}

export default RepoList;
