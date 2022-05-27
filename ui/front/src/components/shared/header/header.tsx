import { AddButton, Balance, Profile } from '@components/shared';
import styles from './header.module.css';

type HeaderPropsType = {
  pKey:string
  balance: number,
};

function Header({ balance, pKey }:HeaderPropsType) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.nav}>
        <Balance current={balance} />
        <AddButton />
        <Profile pKey={pKey} />
      </div>
    </div>
  );
}

export default Header;
