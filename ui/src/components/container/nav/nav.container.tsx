import { Menu } from 'antd';
import { Link } from 'react-router-dom';
import style from './nav.module.css';

const Nav = () => (
  <>
    <div className={style.nav}>
      <Menu
        defaultSelectedKeys={['1']}
        defaultOpenKeys={['1']}
        mode="horizontal"
      >
        <Menu.Item key="1">
          <Link to="/repos/1">All Repos</Link>
        </Menu.Item>
        <Menu.Item key="2">
          <Link to="/my-repos/1">My repository</Link>
        </Menu.Item>
      </Menu>
    </div>
  </>
);

export default Nav;
