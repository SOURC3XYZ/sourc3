import {
  Button, Dropdown, Menu, Typography
} from 'antd';
import Modal from 'antd/lib/modal/Modal';
import DefaultAvatar from 'boring-avatars';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from '@libs/redux';
import Avatar from '@components/shared/profiles-page/avatar/avatar';
import styles from './profile.module.scss';

type profileType = {
  pKey: string
};

function Profile({ pKey }:profileType) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  // const showModal = () => {
  //   setVisible(true);
  // };
  const { profileImage } = useSelector(((
    state
  ) => ({ profileImage: state.profile.user_avatar_ipfs_hash })));
  const handleCancel = () => setVisible(false);
  const handleOk = () => handleCancel();
  const logOut = () => navigate('/');
  const myOrg = () => navigate('/organizations/my/1');
  const myRep = () => navigate('/repos/my/1');
  const myProfile = () => navigate(`/profiles/${pKey}`);

  const data = [
    { title: 'Profile', onClick: myProfile },
    { title: 'My repositories', onClick: myRep },
    { title: 'My organization', onClick: myOrg },
    { title: 'Settings', isDisabled: true },
    { title: 'Help', isDisabled: true },
    { title: 'Support', isDisabled: true },
    { title: 'Twitter', link: 'https://twitter.com/SOURC3xyz' },
    { title: 'Discord', link: 'https://discord.gg/nqTTMXrhMc' },
    { title: 'Logout', onClick: logOut }
  ];
  const menu = (
    <Menu>
      {data.map(({
        title, onClick, link, isDisabled
      }) => (
        <Menu.Item key={`menu-item-${title}`}>
          <Button
            type="link"
            className={styles.button}
            href={link}
            onClick={onClick}
            disabled={isDisabled}
            target="_blank"
          >
            {title}

          </Button>
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
          overlayStyle={{ position: 'fixed' }}
        >
          <div>
            {
              profileImage ? (
                <Avatar
                  src={profileImage}
                  small
                />
              )
                : (
                  <DefaultAvatar
                    size={40}
                    name={pKey}
                    variant="beam"
                    colors={[
                      '#FF791F',
                      '#3FD05A',
                      '#000000',
                      '#C271B4',
                      '#4DA2E6',
                      '#DDDDDD',
                      '#92A1C6',
                      '#146A7C',
                      '#F0AB3D',
                      '#C271B4',
                      '#C20D90'
                    ]}
                  />
                )
            }

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
