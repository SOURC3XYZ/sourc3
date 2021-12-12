import { ActionColor } from '@libs/constants';
import { colorizer, setGradient } from '@libs/utils';
import { RepoType } from '@types';
import { List } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';
import { BeamButton } from './beam-button';

type ListItemProps = {
  elements: RepoType[],
  deleteRepos: (repo_id: number) => void
};

const ListRender = ({ elements, deleteRepos }:ListItemProps) => {
  const colorList = React.useMemo(() => Object.values(ActionColor), []);
  return (
    <List
      split
      bordered
      loading={Boolean(!elements.length)}
      size="small"
      pagination={{
        pageSize: 8
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
