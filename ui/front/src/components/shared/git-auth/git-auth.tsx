import axios from 'axios';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from '@libs/redux';
import { AC } from '@libs/action-creators';
import { HOST } from '@components/shared/git-auth/profile/constants';
import { useNavigate } from 'react-router-dom';
import { NavButton } from '../nav-button';
import styles from './git-auth.module.scss';
import { Popup } from '../popup';
import { LoginSocialGithub } from './LoginSocialGithub';

type GitConnectAuthProps = {
  name: string,
  small?: boolean
  why?:boolean
};

function GitConnectAuth({ name, small, why }:GitConnectAuthProps) {
  const isAuth = Boolean(useSelector((state) => state.profile.data.token));
  const className = small ? styles.headerBtn : styles.buttonAuth;
  const clientId = 'bfa3e88331da0771663c';
  const navigate = useNavigate();
  const [isVisible, setVisible] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isErr, setIsErr] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (isAuth) {
      setIsDisabled(true);
    } else {
      setIsDisabled(false);
    }
  }, [isAuth]);

  return (
    <>
      <div className={styles.wrapper}>
        <LoginSocialGithub
          client_id={clientId}
          redirect_uri={`${window.location.origin}/git-auth`}
          onResolve={({ data }) => {
            axios.get(`${HOST}/login?code=${data.code}`)
              .then((res) => {
                window.localStorage.setItem('token', res.data.token);
                axios({
                  method: 'get',
                  url: `${HOST}/user`,
                  withCredentials: false,
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${res.data.token}`
                  }
                }).then((result) => {
                  try {
                    if (result) {
                      dispatch(AC.getAuthGitUser(result));
                      navigate(`/profile/${result.data.github_login}`);
                    }
                  } catch (err) {
                    setIsErr(true);
                  }
                })
                  .catch(() => {
                    setVisible(false);
                    setIsErr(true);
                  });
                setIsDisabled(true);
              })
              .catch(() => {
                setVisible(false);
                setIsErr(true);
              });
          }}
          scope="read:user user:email repo"
        >
          <NavButton
            name={name}
            inlineStyles={!isDisabled ? { display: 'block' } : { display: 'none' }}
            classes={className}
          />
        </LoginSocialGithub>
        {why && !isDisabled && <a className={styles.whyLink} target="_blank" href="https://www.sourc3.xyz/why-connect-to-github" rel="noreferrer">Why connect? Learn more</a>}
      </div>
      <Popup
        visible={isVisible}
        title={isErr ? 'Failed to connect with Github' : 'You are connected'}
        onCancel={() => (setVisible(false))}
        agree
        confirmButton={(
          <NavButton
            name="Ok"
            inlineStyles={{ width: '278px' }}
            onClick={() => (setVisible(false))}
            active
          />
        )}
      >
        <span>
          {isErr ? 'Failed to connect with Github' : 'Thank you. You are connected'}
        </span>
      </Popup>
    </>
  );
}

export default GitConnectAuth;
