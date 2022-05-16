import { OwnerListType, Project } from '@types';
import { List } from 'antd';
import { PaginationConfig } from 'antd/lib/pagination';
import {
  useEffect, useMemo, useRef, useState
} from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './project-list.module.scss';
import ProjectListItem from './project-list-item';

type ListProps = {
  items: Project[],
  searchText:string,
  path:string
  type: OwnerListType,
  page:number,
  orgId: number
};

function ProjectList({
  items, searchText, path, type, page, orgId
}:ListProps) {
  const navigate = useNavigate();
  const textCash = useRef(searchText);

  const [pageSize, setPageSize] = useState(4);

  const onChange = (next:number) => navigate(`${path}projects/${orgId}/${type}/${next}`);

  useEffect(() => {
    if (textCash.current !== searchText) {
      textCash.current = searchText;
      navigate(`${path}projects/${orgId}/${type}/${1}`, { replace: true });
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
    showSizeChanger: true,
    responsive: true,
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
        <ProjectListItem
          orgId={orgId}
          type={type}
          item={item}
          path={path}
          searchText={searchText}
        />
      )}
    />
  );
}

export default ProjectList;
