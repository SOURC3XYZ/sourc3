import { OwnerListType } from '@types';
import { List } from 'antd';
import { PaginationConfig } from 'antd/lib/pagination';
import {
  useEffect, useMemo, useRef, useState
} from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './entity-list.module.scss';

type ListRenderProps<T> = {
  path: string,
  page: number,
  items: T[],
  renderItem: (item: T) => JSX.Element
  type: OwnerListType;
  searchText: string;
  route?: string
};

function EntityList<T>({
  page = 1, type = 'all', route = 'repos', items, searchText, path, renderItem
}:ListRenderProps<T>) {
  const navigate = useNavigate();
  const textCash = useRef(searchText);

  const [pageSize, setPageSize] = useState(4);

  const onChange = (next:number) => navigate(`${path}${route}/${type}/${next}`);

  useEffect(() => {
    if (textCash.current !== searchText) {
      textCash.current = searchText;
      // navigate(`${path}${route}/${type}/${1}`, { replace: true });
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
    showSizeChanger: true,
    responsive: true,
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
      // pagination={paginationVisible}
      dataSource={items}
      renderItem={renderItem}
    />
  );
}

export default EntityList;
