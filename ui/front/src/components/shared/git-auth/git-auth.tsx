import { useState } from 'react';

import { loginWithGithub } from 'github-oauth-popup';
import { NavButton } from '../nav-button';
import styles from './git-auth.module.scss';

type GitConnectAuthProps = {
  name: string,
  small?: boolean
};

const style = {
  width: '102px',
  textAlign: 'center',
  lineHeight: '16px',
  height: '36px',
  fontWeight: 800,
  color: 'black',
  background: '#FF791F',
  padding: 0,
  fontSize: '14px',
  fontFamily: 'PublicSans-regular',
  marginLeft: '30px'
};

const className = [styles.buttonAuth].join(',');

function GitConnectAuth({ name, small }:GitConnectAuthProps) {
  const [isDisabled, setIsDisabled] = useState(false);
  const params = {
    client_id: 'bfa3e88331da0771663c'
  };
  const options = {
    height: 650,
    width: 850
  };

  const onClick = () => {
    loginWithGithub(params, options)
      .then(() => setIsDisabled(true));
  };
  return (
    <NavButton
      name={name}
      onClick={onClick}
      //   inlineStyles={small && style}
      isDisabled={isDisabled}
      classes={className}
    />
  );
}

export default GitConnectAuth;
