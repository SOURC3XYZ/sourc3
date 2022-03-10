import { Menu } from 'antd';
import { ContainerOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import styles from './menu.module.css';

const NavMenu = () => {
  const style = {
    display: 'flex',
    maxWidth: '74rem',
    margin: '0 auto',
    justifyContent: 'flex-start',
    borderRight: 'none',
    padding: '0 1rem'
  };

  return (
    <div className={styles.menu}>
      <Menu
        style={style}
        defaultSelectedKeys={['all']}
        defaultOpenKeys={['all']}
      >
        <Menu.Divider />
        <Menu.Item key="all" icon={<ContainerOutlined />}>
          <Link to="/main/repos/all/1">Repositories</Link>
        </Menu.Item>
        <Menu.Item key="local" icon={<ContainerOutlined />}>
          <Link to="/main/localRepos">Local Repositories</Link>
        </Menu.Item>
      </Menu>
    </div>
  );
};

export default NavMenu;
