import avatar from '@assets/icons/icon-avatar.png';
import {
  Button, Dropdown, Menu, Typography
} from 'antd';
import Modal from 'antd/lib/modal/Modal';
import { useState } from 'react';
import styles from './profile.module.scss';

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
  const data = [
    { title: 'Profile', onClick: showModal },
    { title: 'My repositories' },
    { title: 'Settings' },
    { title: 'Help' },
    { title: 'Support' },
    { title: 'Twitter' },
    { title: 'Discord' },
    { title: 'Logout' }
  ];
  const menu = (
    <Menu>
      {data.map(({ title, onClick }) => (
        <Menu.Item key={`menu-item-${title}`}>
          <Button type="link" className={styles.button} onClick={onClick}>{title}</Button>
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <>
      <div className={styles.wrapper}>
        <Dropdown
          overlay={menu}
          placement="bottomCenter"
          trigger={['click']}
          overlayClassName={styles.dropdown}
        >
          <div>
            <img src={avatar} alt="" />
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
