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
  loading: boolean;
  searchText: string;
};

const ListRender = ({
  page = 1, elements, searchText, deleteRepos, loading, type = 'repos'
}:ListItemProps) => {
  const navigate = useNavigate();
  const textCash = React.useRef(searchText);
  const colorList = React.useMemo(() => Object.values(ActionColor), []);

  React.useEffect(() => {
    if (textCash.current !== searchText) {
      textCash.current = searchText;
      navigate(`/repos/${type}/${1}`);
    }
  }, [searchText]);

  return (
    <List
      split
      bordered
      loading={loading}
      size="small"
      pagination={{
        hideOnSinglePage: true,
        pageSize: 8,
        current: page,
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
                    `/repo/${item.repo_id}&${item.repo_name}/tree/`
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
