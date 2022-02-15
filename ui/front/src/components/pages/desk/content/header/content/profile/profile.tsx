import { UserOutlined } from '@ant-design/icons';
import {
  Avatar, Button, Dropdown, Menu, Typography
} from 'antd';
import Modal from 'antd/lib/modal/Modal';
import { useState } from 'react';
import { Link } from 'react-router-dom';

type profileType = {
  pKey: string
};

const Profile = ({ pKey }:profileType) => {
  console.log(pKey);

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
        <Button type="link">
          <Link type="link" to="/auth">
            Log out
          </Link>

        </Button>
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      <div className="wrapper">
        <Dropdown
          overlay={menu}
          placement="bottomCenter"
          trigger={['click']}
        >
          <div>
            <Avatar size="large" icon={<UserOutlined />} />
            <span>yourmail.@gmail.com</span>
          </div>
        </Dropdown>
      </div>
      <Modal
        title="RECEIVE PIT"
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
};

export default Profile;
