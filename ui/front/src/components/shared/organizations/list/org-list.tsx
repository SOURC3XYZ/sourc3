import { Organization, OwnerListType } from '@types';

import { List } from 'antd';
import { PaginationConfig } from 'antd/lib/pagination';
import {
  useEffect, useMemo, useRef, useState
} from 'react';
import { useNavigate } from 'react-router-dom';
import OrgListItem from './org-list-item';
import styles from './org-list.module.scss';

type ListProps = {
  items: Organization[],
  searchText:string,
  path:string
  type: OwnerListType,
  page:number
};

function OrgList({
  items, searchText, path, type, page
}:ListProps) {
  const navigate = useNavigate();
  const textCash = useRef(searchText);

  const [pageSize, setPageSize] = useState(4);

  const onChange = (next:number) => navigate(`${path}organizations/${type}/${next}`);

  useEffect(() => {
    if (textCash.current !== searchText) {
      textCash.current = searchText;
      navigate(`${path}organizations/${type}/${1}`, { replace: true });
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
        <OrgListItem
          type={type}
          item={item}
          path={path}
          searchText={searchText}
        />
      )}
    />
  );
}

export default OrgList;
