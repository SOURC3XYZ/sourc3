import React from 'react';
import { Menu } from 'antd';
import { Link } from 'react-router-dom';

// type NavProps = {
//
// };

const Nav = () => (
  <>
    <Menu
      style={{ width: 780 }}
      defaultSelectedKeys={['1']}
      defaultOpenKeys={['sub1']}
      mode="horizontal"
    >
      <Menu.Item key="link">
        <Link to="/repos">All Repos</Link>
      </Menu.Item>
      <Menu.Item key="link">
        <Link to="/my-repos">My repository</Link>
      </Menu.Item>
    </Menu>
  </>
);

export default Nav;
