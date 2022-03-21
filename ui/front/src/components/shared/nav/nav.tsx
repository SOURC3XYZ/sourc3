import { RepoListType } from '@types';
import { Menu } from 'antd';
import { Link } from 'react-router-dom';
import style from './nav.module.scss';

type NavProps = {
  type: RepoListType
  path:string
};

const Nav = ({ type, path }:NavProps) => {
  const items = [
    {
      key: 'all',
      to: `${path}repos/all/1`,
      text: 'All Repository'
    },
    {
      key: 'my',
      to: `${path}repos/my/1`,
      text: 'My Repository'
    }
  ];

  const itemsRender = items.map(({ to, text, key }) => (
    <Menu.Item key={key}>
      <Link to={to}>{text}</Link>
    </Menu.Item>
  ));

  return (
    <div className={style.nav}>
      <Menu
        defaultSelectedKeys={[type]}
        mode="horizontal"
      >
        {itemsRender}
      </Menu>
    </div>
  );
};

export default Nav;
