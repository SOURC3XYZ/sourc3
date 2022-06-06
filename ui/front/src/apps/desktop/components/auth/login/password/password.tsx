import { NavButton } from '@components/shared';
import { Input } from 'antd';
import { Link } from 'react-router-dom';
import styles from '../login.module.scss';

type PasswordProps = {
  pass: string,
  onInput: (e: React.ChangeEvent<HTMLInputElement>) => void,
  onSubmit: () => void
};

const placeholder = 'Enter your password';

function Password({ pass, onInput, onSubmit }:PasswordProps) {
  return (
    <>
      <label htmlFor="password">
        <Input.Password
          className={styles.password}
          placeholder={placeholder}
          onChange={onInput}
          value={pass}
          type="password"
        />
      </label>

      <Link className={styles.forgot} to="/auth/restore">
        Forgot password?
      </Link>

      <div className={styles.btnNav}>
        <NavButton
          name="Sign in"
          link="/auth/login"
          onClick={onSubmit}
        />
        <NavButton
          name="Back"
          link="/auth/"
        />
      </div>
    </>
  );
}

export default Password;
