import { RepoType } from '@types';
import { List } from 'antd';
import { Link } from 'react-router-dom';

type ListItemProps = {
  elements: RepoType[]
};

const ListRender = ({ elements }:ListItemProps) => (
  <List
    dataSource={elements}
    renderItem={(item) => (
      <List.Item key={item.repo_id}>
        <List.Item.Meta
          title={(
            <Link
              to={
                `/repos/${item.repo_id}/tree`
              }
              state={{ id: item.repo_id }}
            >
              {item.repo_name}
            </Link>
          )}
          description={`repo id: ${item.repo_id}`}
        />
      </List.Item>
    )}
  />
);

export default ListRender;
