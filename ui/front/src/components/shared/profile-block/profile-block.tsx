import { AddButtonOrg, Balance, Profile } from '@components/shared';
import Avatar from '@components/shared/git-auth/profile/avatar/avatar';
import { Link } from 'react-router-dom';
import { useSelector } from '@libs/redux';
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

  return (
    <div className={styles.wrapper}>
      {pKey && <AddButtonOrg />}
      {balance && <Balance />}
      {profile && <Profile pKey={pKey} />}
      {git && (
        <Link to={`/profile/${login}`}>
          <Avatar small />
        </Link>
      ) }
    </div>
  );
}

export default ProfileBlock;
