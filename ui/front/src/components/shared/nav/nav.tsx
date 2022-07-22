import { RepoListType } from '@types';
import { Menu } from 'antd';
import { Link } from 'react-router-dom';
import style from './nav.module.scss';

export type NavItem = {
  key: string,
  to: string,
  text: string
};

type NavProps = {
  type: RepoListType
  items:NavItem []
};

function Nav({ type, items }:NavProps) {
  const itemsRender = items.map(({ to, text, key }) => (
    <Menu.Item key={key}>
      <Link to={to}>{text}</Link>
    </Menu.Item>
  ));

  return (
    <div className={style.nav}>
      <Menu
        selectedKeys={[type]}
        mode="horizontal"
      >
        {itemsRender}
      </Menu>
    </div>
  );
}

export default Nav;
