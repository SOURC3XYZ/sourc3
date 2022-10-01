import { List } from 'antd';
import { PaginationConfig } from 'antd/lib/pagination';
import {
  useEffect, useMemo, useRef, useState
} from 'react';
import styles from './entity-list.module.scss';

type ListRenderProps<T> = {
  page: number,
  items: T[],
  renderItem: (item: T) => JSX.Element
  searchText: string;
};

function EntityList<T>({
  page = 1, items, searchText, renderItem
}:ListRenderProps<T>) {
  const textCash = useRef(searchText);

  const [pageSize, setPageSize] = useState(4);
  const [current, setCurrentPage] = useState(1);

  // const onChange = (next:number) => navigate(`${path}${route}/${type}/${next}`);

  const onChange = (next:number) => setCurrentPage(next);

  useEffect(() => {
    if (textCash.current !== searchText) {
      textCash.current = searchText;
      // navigate(`${path}${route}/${type}/${1}`, { replace: true });
    }
  }, [searchText]);

  const onShowSizeChange = (currentSize:number, size:number) => {
    if (currentSize !== pageSize) setPageSize(size);
  };

  const pagination:PaginationConfig = {
    className: styles.pagination,
    size: 'small',
    current,
    pageSizeOptions: ['4', '8', '16', '32', '64', '128'],
    showSizeChanger: true,
    responsive: true,
    pageSize,
    onChange,
    onShowSizeChange
  };

  const paginationVisible = useMemo(
    () => !!items.length && pagination,
    [items, page, pageSize, current]
  );

  return (
    <List
      className={styles.list}
      bordered
      size="small"
      pagination={paginationVisible}
      dataSource={items}
      renderItem={renderItem}
    />
  );
}

export default EntityList;
