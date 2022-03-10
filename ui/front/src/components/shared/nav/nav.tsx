import { RepoListType } from '@types';
import { Menu } from 'antd';
import { Link } from 'react-router-dom';
import style from './nav.module.css';

type NavProps = {
  type: RepoListType
  path:string
};

const Nav = ({ type, path }:NavProps) => (
  <>
    <div className={style.nav}>
      <Menu
        defaultSelectedKeys={[type]}
        mode="horizontal"
      >
        <Menu.Item key="all">
          <Link to={`${path}repos/all/1`}>All Repository</Link>
        </Menu.Item>
        <Menu.Item key="my">
          <Link to={`${path}repos/my/1`}>My repository</Link>
        </Menu.Item>
      </Menu>
    </div>
  </>
);

export default Nav;
