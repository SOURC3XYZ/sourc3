import { Button } from 'antd';
import { Link } from 'react-router-dom';
import styles from './start.module.css';
import icon from '../../../../../assets/img/TurtuleZorro.png';

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
      <Button style={{ borderRadius: 7 }}>
        <Link to="/auth/login">Sign in</Link>
      </Button>
      <Button style={{ borderRadius: 7 }}>
        <Link to="/auth/sign-up">Get Started</Link>
      </Button>
    </div>
  </div>
);

export default Start;
