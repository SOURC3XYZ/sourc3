import { RepoListType } from '@types';
import { Menu } from 'antd';
import { Link } from 'react-router-dom';
import style from './nav.module.css';

type NavProps = {
  type: RepoListType
};

const Nav = ({ type }:NavProps) => (
  <>
    <div className={style.nav}>
      <Menu
        defaultSelectedKeys={[type]}
        mode="horizontal"
      >
        <Menu.Item key="all">
          <Link to="/main/repos/all/1">All Repository</Link>
        </Menu.Item>
        <Menu.Item key="my">
          <Link to="/main/repos/my/1">My repository</Link>
        </Menu.Item>
      </Menu>
    </div>
  </>
);

export default Nav;
