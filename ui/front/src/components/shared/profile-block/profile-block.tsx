import { AddButtonOrg, Balance, Profile } from '@components/shared';
import Avatar from '@components/shared/git-auth/profile/avatar/avatar';
import styles from './profile-block.module.scss';

type HeaderPropsType = {
  pKey?:string,
  profile?: boolean,
  balance?: boolean,
  git?: boolean,
};

function ProfileBlock({
  pKey, profile, balance, git
}:HeaderPropsType) {
  return (
    <div className={styles.wrapper}>
      {pKey && <AddButtonOrg />}
      {balance && <Balance />}
      {profile && <Profile pKey={pKey} />}
      {git && <Avatar small /> }
    </div>
  );
}

export default ProfileBlock;
