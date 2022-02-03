import { Menu } from 'antd';
import { ContainerOutlined, UserOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import styles from './menu.module.css';
import { NavButton } from '..';

const NavMenu = () => {
  const style = {
    width: '256px',
    height: '696px'
  };
  return (
    <div className={styles.menu}>
      <Menu
        style={style}
        defaultSelectedKeys={['1']}
        defaultOpenKeys={['sub1']}
        mode="inline"
      >
        <NavButton link="/auth" name="Back" />
        <Menu.Divider />
        <Menu.Item key="all" icon={<ContainerOutlined />}>
          <Link to="/main/repos/all/1">Repositories</Link>
        </Menu.Item>
        <Menu.Item key="manager" icon={<UserOutlined />}>
          <Link to="/main/manager">Manager</Link>
        </Menu.Item>

      </Menu>
    </div>
  );
};

export default NavMenu;
