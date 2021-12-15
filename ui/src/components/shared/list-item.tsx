import { ActionColor } from '@libs/constants';
import { colorizer, setGradient } from '@libs/utils';
import { RepoType } from '@types';
import { List } from 'antd';
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BeamButton } from './beam-button';
import Excretion from './excretion';

type ListItemProps = {
  page: number,
  elements: RepoType[],
  deleteRepos: (repo_id: number) => void
  type: string;
  isLoading: boolean;
  searchText: string;
};

const ListRender = ({
  page = 1, elements, searchText, deleteRepos, isLoading, type = 'repos'
}:ListItemProps) => {
  const navigate = useNavigate();
  const colorList = React.useMemo(() => Object.values(ActionColor), []);
  return (
    <List
      split
      bordered
      loading={isLoading}
      size="small"
      pagination={{
        current: page,
        pageSize: 8,
        onChange: (next) => navigate(`/repos/${type}/${next}`)
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
                  <Excretion name={item.repo_name} inputText={searchText} />
                </Link>
              )}
              description={(
                <>
                  <span>id: </span>
                  <Excretion
                    name={String(item.repo_id)}
                    inputText={searchText}
                  />
                </>
              )}
            />
          </List.Item>
        );
      }}
    />
  );
};

export default ListRender;
