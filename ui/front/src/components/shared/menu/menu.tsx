import { Button, Menu } from 'antd';
import { ContainerOutlined, UserOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import styles from './menu.module.css';

const NavMenu = () => {
  const handleClick = (e: any) => {
    console.log('click ', e);
  };

  const style = {
    width: '256px',
    height: '696px'
  };
  return (
    <div className={styles.menu}>
      <Menu
        onClick={handleClick}
        style={style}
        defaultSelectedKeys={['1']}
        defaultOpenKeys={['sub1']}
        mode="inline"
      >
        <Button>
          <Link to="/auth">Back</Link>
        </Button>
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
