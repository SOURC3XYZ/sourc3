import { RepoType } from '@types';
import { List } from 'antd';
import { useEffect, useRef } from 'react';
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

  const onChange = (next:number) => navigate(`${path}repos/${type}/${next}`);

  useEffect(() => {
    if (textCash.current !== searchText) {
      textCash.current = searchText;
      navigate(`${path}repos/${type}/${1}`, { replace: true });
    }
  }, [searchText]);

  const pagination = {
    hideOnSinglePage: true,
    pageSize: 3,
    current: page,
    onChange
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
