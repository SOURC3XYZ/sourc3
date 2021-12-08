import { RepoType } from '@types';
import { List, Button } from 'antd';
import { Link } from 'react-router-dom';
import { AppThunkDispatch, thunks } from '@libs/redux';
import { connect } from 'react-redux';

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
            <Link to={
              `/repos/${item.repo_id}/tree`
            }
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

const mapState = (
  _:undefined, { elements }: { elements: RepoType[] }
) => ({
  elements
});

const mapDispatch = (dispatch: AppThunkDispatch) => ({
  deleteRepos: (repo_id: number) => {
    dispatch(thunks.deleteRepos(repo_id));
  }
});

export default connect(mapState, mapDispatch)(ListRender);
