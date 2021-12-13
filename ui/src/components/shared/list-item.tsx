import { ActionColor } from '@libs/constants';
import { colorizer, setGradient } from '@libs/utils';
import { RepoType } from '@types';
import { List } from 'antd';
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BeamButton } from './beam-button';

type ListItemProps = {
  page: number,
  elements: RepoType[],
  deleteRepos: (repo_id: number) => void
};

const ListRender = ({ page = 1, elements, deleteRepos }:ListItemProps) => {
  const navigate = useNavigate();
  const colorList = React.useMemo(() => Object.values(ActionColor), []);
  return (
    <List
      split
      bordered
      loading={Boolean(!elements.length)}
      size="small"
      pagination={{
        current: page,
        pageSize: 8,
        onChange: (next) => navigate(`/repos/${next}`)
      }}
      dataSource={elements}
      renderItem={(item) => {
        const background = setGradient(
          colorizer(item.repo_id, colorList),
          ActionColor.DARKISH_BLUE
        );
        return (
          <List.Item
            style={{ background }}
            key={item.repo_id}
            actions={[(
              <BeamButton
                title="Delete"
                callback={() => deleteRepos(item.repo_id)}
              />
            )]}
          >
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
          </List.Item>
        );
      }}
    />
  );
};

export default ListRender;
