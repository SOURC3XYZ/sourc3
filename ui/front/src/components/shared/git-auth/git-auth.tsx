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
    if (window.localStorage.getItem('id')) {
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
                window.localStorage.setItem('id', res.data.id);
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
