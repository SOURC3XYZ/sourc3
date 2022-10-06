import { AddButtonOrg, Balance, Profile } from '@components/shared';
import Avatar from '@components/shared/git-auth/profile/avatar/avatar';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from '@libs/redux';
import { Button, Dropdown, Menu } from 'antd';
import { useGitProfile } from '@libs/hooks/thunk';
import styles from './profile-block.module.scss';

type HeaderPropsType = {
  pKey?: string,
  profile?: boolean,
  balance?: boolean,
  git?: boolean,
};

function ProfileBlock({
  pKey, profile, balance, git
}:HeaderPropsType) {
  const login = useSelector((state) => state.profile.data.github_login);

  const navigate = useNavigate();

  const { setGitUserLogout } = useGitProfile();

  const data = [
    { title: 'Profile' },
    { title: 'My repositories', isDisabled: true },
    { title: 'My organization', isDisabled: true, delimeter: true },
    {
      title: 'Onboarding',
      onClick: (e:any) => {
        e.preventDefault();
        navigate('/onboarding');
      }
    },
    {
      title: 'Referral program',
      delimeter: true,
      onClick: (e:any) => {
        e.preventDefault();
        navigate('/referral-programm');
      }
    },
    { title: 'Twitter', link: 'https://twitter.com/SOURC3xyz' },
    { title: 'Discord', link: 'https://discord.gg/nqTTMXrhMc', delimeter: true },
    { title: 'Logout', onClick: setGitUserLogout }
  ];
  const menu = (
    <Menu>
      {data.map(({
        title, onClick, link, isDisabled, delimeter
      }) => (
        <Menu.Item
          className={delimeter ? styles.bordered : ''}
          key={`menu-item-${title}`}
        >
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
    <div className={styles.wrapper}>
      {pKey && <AddButtonOrg />}
      {balance && <Balance />}
      {profile && pKey && <Profile pKey={pKey} />}
      {git && (
        <Dropdown
          overlay={menu}
          placement="bottomCenter"
          trigger={['hover']}
          overlayClassName={styles.dropdown}
          overlayStyle={{ position: 'fixed' }}
        >
          <Link to={`/profile/${login}`}>
            <Avatar small />
          </Link>
        </Dropdown>
      ) }
    </div>
  );
}

export default ProfileBlock;
