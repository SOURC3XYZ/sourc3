import { loadingData } from '@libs/utils';
import { Button, Input } from 'antd';
import Text from 'antd/lib/typography/Text';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
// import icon from '../../../../../assets/img/TurtuleZorro.png';
import { Preload } from '@components/shared';
import { useAsyncError } from '@libs/hooks';
import styles from './login.module.css';

type LoginProps = {
  startWalletApi: (password: string) => (
    resolve: PromiseArg<string>, reject: PromiseArg<string>
  ) => void
};

const Login = ({ startWalletApi }: LoginProps) => {
  const [isLoading, setLoading] = React.useState(false);
  const [pass, setPass] = React.useState('');
  const throwError = useAsyncError();
  const navigate = useNavigate();

  const onSubmit = () => {
    loadingData(startWalletApi(pass) as (
      resolve: PromiseArg<string>, reject?: PromiseArg<string>
    ) => void)
      .then(() => navigate('/main/repos/all/1'))
      .catch((data: string) => throwError(new Error(data)));
    setLoading(true);
  };

  const onPassInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPass(e.target.value);
  };

  return (
    <div className={styles.wrapper}>
      {isLoading
        ? <Preload />
        : (
          <>
            <Text
              style={{ marginBottom: 30 }}
            >
              Sign In using your password

            </Text>
            <Text>Password</Text>
            <label htmlFor="password">
              <Input.Password
                onChange={onPassInputChange}
                value={pass}
                type="password"
              />
            </label>
            <Link to="/auth/restore">
              I forgot my password
            </Link>
            <div className={styles.btnNav}>
              <Button style={{ borderRadius: 7 }}>
                <Link to="/auth">Back</Link>
              </Button>
              <Button onClick={onSubmit} style={{ borderRadius: 7 }}>
                <Link to="/auth/login">Sign in</Link>
              </Button>
            </div>
          </>
        )}
    </div>
  );
};

export default Login;

/* <img width={100} height={105} style={{ marginRight: 20 }} src={icon} alt="Incognito" /> */
