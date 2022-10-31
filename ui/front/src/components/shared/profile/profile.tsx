import {
  Button, Dropdown, Menu, Typography
} from 'antd';
import Modal from 'antd/lib/modal/Modal';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from '@libs/redux';
import { IpfsAvatars } from '@components/shared';
import { AVATAR_COLORS } from '@libs/constants';
import styles from './profile.module.scss';

type ProfileProps = {
  pKey: string
};

function Profile({ pKey }:ProfileProps) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  // const showModal = () => {
  //   setVisible(true);
  // };
  const profileImage = useSelector(((
    state
  ) => state.sc3Frofile.user_avatar_ipfs_hash));

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

  const image = useMemo(() => pKey && (
    <IpfsAvatars
      colors={AVATAR_COLORS}
      name={pKey}
      size={36}
      variant="beam"
      ipfs={profileImage}
    />
  ), [profileImage, pKey]);

  return (
    <>
      <div className={styles.wrapper}>
        <Dropdown
          overlay={menu}
          placement="bottom"
          trigger={['click']}
          overlayClassName={styles.dropdown}
          overlayStyle={{ position: 'fixed' }}
        >
          <div>
            {image}
          </div>
        </Dropdown>
      </div>
      <Modal
        title="RECEIVE SC3"
        open={visible}
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
