import { RepoType } from '@types';
import { List, Button } from 'antd';
import { Link } from 'react-router-dom';

type ListItemProps = {
  elements: RepoType[],
  deleteRepos: (repo_id: number) => void
};

const ListRender = ({ elements, deleteRepos }:ListItemProps) => (
  <List
    dataSource={elements}
    renderItem={(item) => (
      <List.Item key={item.repo_id}>
        <List.Item.Meta
          title={(
            <Link
              to={
                `/repo/${item.repo_id}/tree`
              }
              state={{ id: item.repo_id }}
            >
              {item.repo_name}
            </Link>
          )}
          description={`repo id: ${item.repo_id}`}
        />
        <Button
          type="primary"
          onClick={() => (deleteRepos(item.repo_id))}
        >
          Delete
        </Button>
      </List.Item>
    )}
  />
);

export default ListRender;
