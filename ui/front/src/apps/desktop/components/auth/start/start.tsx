import { NavButton } from '@components/shared';
import { Popup } from '@components/shared/popup';
import { Sourc3Logo } from '@components/svg';
import { useState } from 'react';
import styles from './start.module.scss';

interface StartProps {
  restore?: boolean
}

function Start({ restore }:StartProps) {
  const btnNameLeft = restore ? 'Restore client' : 'Sign in';
  const btnNameRight = restore ? 'Create new' : 'Get started';
  const linkLeft = restore ? '/auth/restore' : '/auth/login';
  const linkRight = '/auth/sign-up';

  const [isPopup, setIsPopup] = useState(false);
  const onCancel = () => {
    setIsPopup(false);
  };

  return (
    <div className={restore ? styles.wrapper_light : styles.wrapper}>
      <div className={styles.logo}>
        {restore ? <Sourc3Logo fill="#000" /> : <Sourc3Logo fill="#fff" />}
        <h3>desktop client</h3>
      </div>
      <div className={styles.intro}>
        <h2>
          Where
          {' '}
          <span>Web3</span>
          {' '}
          builds
        </h2>
      </div>
      <div className={styles.btnNav}>
        {
          restore ? (
            <NavButton
              name={btnNameLeft}
              onClick={() => (setIsPopup(true))}
            />
          ) : (
            <NavButton
              name="Sign In"
              link="/auth/login"
            />
          )
        }
        <NavButton name={btnNameRight} link={linkRight} />
      </div>
      <div className={styles.version}>Version 0.52</div>
      <Popup
        visible={isPopup}
        title="Restore client"
        onCancel={onCancel}
        agree
        confirmButton={(
          <NavButton
            name="I understand"
            link={linkLeft}
            inlineStyles={{ width: '278px' }}
          />
        )}
      >
        <span>You are trying to restore an existing SOURC3 wallet. Please notice that if you use your wallet on another device, your balance will be up to date, but transaction history and addresses will be kept separately on each device.</span>
      </Popup>
    </div>
  );
}

export default Start;
