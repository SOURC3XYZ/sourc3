import { NavButton } from '@components/shared';
import { Sourc3Logo } from '@components/svg';
import styles from './start.module.scss';

function Start() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.logo}>
        <Sourc3Logo fill="#fff" />
        <h3>desktop client</h3>
      </div>
      <div className={styles.intro}>
        <h2>
          Where
          {' '}
          <span>Web3</span>
          {' '}
          builds
        </h2>
      </div>
      <div className={styles.btnNav}>
        <NavButton name="Sign in" link="/auth/login" />
        <NavButton name="Get Started" link="/auth/sign-up" />
      </div>
      <div className={styles.version}>Version 0.52</div>
    </div>
  );
}

export default Start;
