import Excretion from '@components/shared/excretion';
import { RepoType } from '@types';
import {
  Menu, Dropdown, List, message
} from 'antd';
import { Link } from 'react-router-dom';
import forkImg from '@assets/img/fork.svg';
import shareImg from '@assets/img/share.svg';
import starImg from '@assets/img/star.svg';
import dotsImg from '@assets/img/dots.svg';
import styles from './list-item.module.scss';

type ListItemProps = {
  item: RepoType;
  path: string;
  searchText: string;
  deleteRepos: (repo_id: number) => void;
};

const ListItem = ({
  item, path, searchText, deleteRepos
}:ListItemProps) => {
  const { repo_id, repo_name } = item;

  const iteractionItems = [
    {
      alt: 'fork',
      src: forkImg
    },
    {
      alt: 'share',
      src: shareImg
    },
    {
      alt: 'star',
      src: starImg
    }
  ];

  const deleteRepo = () => deleteRepos(repo_id);

  const iteractionRender = iteractionItems.map(({ alt, src }) => (
    <div>
      <img alt={alt} src={src} />
      <span>10</span>
    </div>
  ));

  const onClick = ({ key }: { key:string }) => {
    message.info(key);
  };

  const link = `${path}repo/${repo_id}&${repo_name}/tree/`;

  const menuRender = (
    <Menu onClick={onClick}>
      <Menu.Item onClick={deleteRepo} key="Unable to delete">
        Delete repo
      </Menu.Item>
      <Menu.Item key="Copied!">Clone Repo</Menu.Item>
    </Menu>
  );

  return (
    <List.Item
      className={styles.listItem}
      key={repo_id}
      actions={[(<span className={styles.time}>Updated 5 mins ago</span>),
        (
          <Dropdown overlay={menuRender} placement="bottomRight">
            <img className={styles.dropdownIcon} alt="dots" src={dotsImg} />
          </Dropdown>
        )
      ]}
    >
      <List.Item.Meta
        title={(
          <div className={styles.title}>
            <Link to={link} state={{ id: repo_id }}>
              <Excretion name={repo_name} inputText={searchText} />
            </Link>
          </div>
        )}
        description={(
          <div className={styles.subtitle}>
            <div className={styles.idField}>
              <span>ID: </span>
              <Excretion
                name={String(repo_id)}
                inputText={searchText}
              />
            </div>
            <div className={styles.interaction}>
              {iteractionRender}
            </div>
          </div>
        )}
      />
    </List.Item>
  );
};

export default ListItem;
