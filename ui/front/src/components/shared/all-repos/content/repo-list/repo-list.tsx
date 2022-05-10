import { RepoType } from '@types';
import { List } from 'antd';
import { PaginationConfig } from 'antd/lib/pagination';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListItem } from './content';
import styles from './repo-list.module.scss';

type ListRenderProps = {
  path: string,
  page: number,
  elements: RepoType[],
  deleteRepos: (repo_id: number) => void
  type: string;
  searchText: string;
};

function RepoList({
  page = 1, type = 'repos', elements, searchText, path, deleteRepos
}:ListRenderProps) {
  const navigate = useNavigate();
  const textCash = useRef(searchText);

  const [pageSize, setPageSize] = useState(4);

  const onChange = (next:number) => navigate(`${path}repos/${type}/${next}`);

  useEffect(() => {
    if (textCash.current !== searchText) {
      textCash.current = searchText;
      navigate(`${path}repos/${type}/${1}`, { replace: true });
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
  return (
    <List
      className={styles.list}
      bordered
      size="small"
      pagination={pagination}
      dataSource={elements}
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
