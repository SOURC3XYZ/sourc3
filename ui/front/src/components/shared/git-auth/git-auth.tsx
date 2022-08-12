import axios from 'axios';
import { useEffect, useState } from 'react';
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
  const className = small ? styles.headerBtn : styles.buttonAuth;
  const clientId = 'bfa3e88331da0771663c';
  const [isVisible, setVisible] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isErr, setIsErr] = useState(false);

  useEffect(() => {
    if (window.localStorage.getItem('token')) {
      setIsDisabled(true);
    }
  }, []);

  return (
    <>
      <div className={styles.wrapper}>
        <LoginSocialGithub
          client_id={clientId}
          redirect_uri={window.location.href}
          onResolve={({ data }) => {
            axios.get(`https://poap-api.sourc3.xyz/login?code=${data.code}`)
              .then((res) => {
                setVisible(true);
                window.localStorage.setItem('token', res.token);
                setIsDisabled(true);
              })
              .catch(() => {
                setVisible(true);
                setIsErr(true);
              });
          }}
          scope="repo,gist'"
        >
          <NavButton
            name={name}
            inlineStyles={!isDisabled ? { display: 'block' } : { display: 'none' }}
            classes={className}
          />
        </LoginSocialGithub>
        {why && !isDisabled && <a className={styles.whyLink} href="#">Why connect? Learn more</a>}
      </div>
      <Popup
        visible={isVisible}
        title={isErr ? 'Failed connect with Github' : 'Your connected with GitHub'}
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
          {isErr ? 'Failed connect with Github' : 'Thank you. Your connected with GitHub'}
        </span>
      </Popup>
    </>
  );
}

export default GitConnectAuth;
