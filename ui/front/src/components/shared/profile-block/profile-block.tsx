import { AddButtonOrg, Balance, Profile } from '@components/shared';
import styles from './profile-block.scss';

type HeaderPropsType = {
  pKey:string
};

function ProfileBlock({ pKey }:HeaderPropsType) {
  return (
    <div className={styles.wrapper}>
      <AddButtonOrg />
      <Balance />
      <Profile pKey={pKey} />
    </div>
  );
}

export default ProfileBlock;
