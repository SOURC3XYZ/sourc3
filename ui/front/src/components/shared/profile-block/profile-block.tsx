import { AddButtonOrg, Balance, Profile } from '@components/shared';
import styles from './profile-block.scss';

type HeaderPropsType = {
  pKey?:string,
  profile?: boolean,
  balance?: boolean,
};

function ProfileBlock({ pKey, profile, balance }:HeaderPropsType) {
  return (
    <div className={styles.wrapper}>
      <AddButtonOrg />
      {balance && <Balance />}
      {profile && <Profile pKey={pKey} />}
    </div>
  );
}

export default ProfileBlock;
