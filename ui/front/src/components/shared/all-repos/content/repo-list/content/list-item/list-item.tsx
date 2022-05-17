import { RepoType } from '@types';
import {
  Menu, Dropdown, List, message
} from 'antd';
import { Link } from 'react-router-dom';
import forkImg from '@assets/img/fork.svg';
import shareImg from '@assets/img/share.svg';
import starImg from '@assets/img/star.svg';
import dotsImg from '@assets/img/dots.svg';
import { Excretion } from '@components/shared';
import { useSelector } from '@libs/redux';
import styles from './list-item.module.scss';

type ListItemProps = {
  item: RepoType;
  path: string;
  searchText: string;
  deleteRepos: (repo_id: number) => void;
};

function ListItem({
  item, path, searchText, deleteRepos
}:ListItemProps) {
  const pkey = useSelector((state) => state.app.pkey);
  const { repo_id, repo_name, repo_owner } = item;

  const repoLink = `sourc3://${repo_owner}/${repo_name}`;

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

  const handleCloneRepo = () => navigator.clipboard.writeText(repoLink);

  const handleDeleteRepo = () => deleteRepos(repo_id);

  const iteractionRender = iteractionItems.map(({ alt, src }) => (
    <div key={`list-item-${alt}`}>
      <img className={styles.dots} alt={alt} src={src} />
      <span>10</span>
    </div>
  ));

  const onClick = ({ key }: { key:string }) => {
    message.info(key);
  };

  const link = `${path}repo/${repo_id}&${repo_name}/tree/`;

  const menuRender = (
    <Menu onClick={onClick}>
      {pkey && (
        <Menu.Item onClick={handleDeleteRepo} key="Unable to delete">
          Delete repo
        </Menu.Item>
      )}
      <Menu.Item onClick={handleCloneRepo} key={`${repoLink} copied to clipboard!`}>
        Clone Repo
      </Menu.Item>
    </Menu>
  );
    return (
    <List.Item
      className={styles.listItem}
      key={repo_id}
      actions={[
        <span
          key={`repo-${item.repo_id}`}
          className={styles.time}
        >
          Updated 5 mins ago
        </span>,
        (
          <Dropdown
            key={`dropdown-${item.repo_id}`}
            overlay={menuRender}
            placement="bottomRight"
          >
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
}

export default ListItem;
