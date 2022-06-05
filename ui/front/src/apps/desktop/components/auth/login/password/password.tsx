import { NavButton } from '@components/shared';
import { Input, Typography } from 'antd';
import { Link } from 'react-router-dom';
import styles from '../login.module.scss';

const { Text } = Typography;

type PasswordProps = {
  pass: string,
  onInput: (e: React.ChangeEvent<HTMLInputElement>) => void,
  onSubmit: () => void
};

function Password({ pass, onInput, onSubmit }:PasswordProps) {
  return (
    <>
      <Text style={{ margin: '0 auto 30px' }}>
        Sign In using your password
      </Text>

      <Text>Password</Text>

      <label htmlFor="password">
        <Input.Password
          onChange={onInput}
          value={pass}
          type="password"
        />
      </label>

      <Link to="/auth/restore">
        I forgot my password
      </Link>

      <div className={styles.btnNav}>
        <NavButton
          name="Back"
          link="/auth"
        />
        <NavButton
          name="Sign in"
          link="/auth/login"
          onClick={onSubmit}
        />
      </div>
    </>
  );
}

export default Password;
