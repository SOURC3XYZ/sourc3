import { UserOutlined } from '@ant-design/icons';
import {
  Avatar, Button, Dropdown, Menu, Typography
} from 'antd';
import Modal from 'antd/lib/modal/Modal';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './profile.module.css';

type profileType = {
  pKey: string
};

function Profile({ pKey }:profileType) {
  const [visible, setVisible] = useState(false);
  const showModal = () => {
    setVisible(true);
  };

  const handleCancel = () => {
    setVisible(false);
  };
  const handleOk = () => {
    handleCancel();
  };
  const menu = (
    <Menu>
      <Menu.Item>
        <Button type="link" onClick={showModal}>Your profile</Button>
      </Menu.Item>
      <Menu.Item>
        <Button type="link">Your repositories</Button>
      </Menu.Item>
      <Menu.Item>
        <Button type="link">Your organizations</Button>
      </Menu.Item>
      <Menu.Item>
        <Button type="link">Settings</Button>
      </Menu.Item>
      <Menu.Item>
        <Button type="link">Help</Button>
      </Menu.Item>
      <Menu.Item>
        <Button type="link">Support</Button>
      </Menu.Item>
      <Menu.Item>
        <Link type="link" to="/auth/">Log out</Link>
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      <div className={styles.wrapper}>
        <Dropdown
          overlay={menu}
          placement="bottomCenter"
          trigger={['click']}
        >
          <div>
            <Avatar size="large" icon={<UserOutlined />} />
          </div>
        </Dropdown>
      </div>
      <Modal
        title="RECEIVE SC3"
        visible={visible}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleOk}>
            OK
          </Button>
        ]}
      >
        <Typography.Text
          copyable={{ text: pKey }}
        >
          {pKey}
        </Typography.Text>
      </Modal>
    </>
  );
}

export default Profile;
