import { Menu } from 'antd';
import { ContainerOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import styles from './menu.module.css';

function NavMenu() {
  const style = {
    display: 'flex',
    maxWidth: '74rem',
    margin: '0 auto',
    justifyContent: 'flex-start',
    borderRight: 'none',
    padding: '0 1rem'
  };

  const linksData = [
    {
      key: 'all',
      to: 'repos/all/1',
      title: 'Repositories'
    },
    {
      key: 'orgs',
      to: 'organizations/all/1',
      title: 'Organizations'
    },
    {
      key: 'local',
      to: 'localRepos',
      title: 'Local Repositories'
    }
  ];

  return (
    <div className={styles.menu}>
      <Menu
        style={style}
        defaultSelectedKeys={['all']}
        defaultOpenKeys={['all']}
      >
        <Menu.Divider />
        {linksData.map((el) => (
          <Menu.Item key={el.key} icon={<ContainerOutlined />}>
            <Link to={el.to}>{el.title}</Link>
          </Menu.Item>
        ))}
      </Menu>
    </div>
  );
}

export default NavMenu;
