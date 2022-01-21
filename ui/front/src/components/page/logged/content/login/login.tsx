import { Button, Input } from 'antd';
import Text from 'antd/lib/typography/Text';
import { Link } from 'react-router-dom';
// import icon from '../../../../../assets/img/TurtuleZorro.png';
import styles from './login.module.css';

const Login = () => (
  <>
    <div className={styles.wrapper}>
      {/* <img width={100} height={105} style={{ marginRight: 20 }} src={icon} alt="Incognito" /> */}
      <Text style={{ marginBottom: 30 }}>Sign In using your password</Text>
      <Text>Password</Text>
      <label htmlFor="password">
        <Input type="password" />
      </label>
      <Link to="">
        I forgot my password
      </Link>
      <div className={styles.btnNav}>
        <Button style={{ borderRadius: 7 }}>
          <Link to="/">Back</Link>
        </Button>
        <Button style={{ borderRadius: 7 }}>
          <Link to="/login">Sign in</Link>
        </Button>
      </div>
    </div>

  </>
);

export default Login;
