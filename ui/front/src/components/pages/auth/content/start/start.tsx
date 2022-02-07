import { NavButton } from '@components/shared';
import icon from '@assets/img/TurtuleZorro.png';
import styles from './start.module.css';

const Start = () => (
  <div className={styles.wrapper}>
    <img
      style={{
        maxWidth: '13.4375rem',
        maxHeight: '14.6875rem'
      }}
      src={icon}
      alt="Incognito"
    />
    <div className={styles.btnNav}>
      <NavButton name="Sign in" link="/auth/login" />
      <NavButton name="Get Started" link="/auth/sign-up" />
    </div>
  </div>
);

export default Start;
