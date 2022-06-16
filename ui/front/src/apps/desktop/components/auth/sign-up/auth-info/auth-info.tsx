import { NavButton } from '@components/shared';
import React from 'react';
import IconLogoHalf from '@assets/icons/icon-logo-auth-half.svg';
import IconLogoBlue from '@assets/icons/icon-logo-auth-blue.svg';
import IconLogoAll from '@assets/icons/icon-logo-auth-all.svg';
import { BackButton } from '@components/shared/back-button';
import styles from './auth-info.module.scss';

type AuthInfoProps = {
  next: () => void;
  back: () => void;
};

function AuthInfo({ next, back }: AuthInfoProps) {
  return (
    <>
      <BackButton onClick={back} />
      <div className={styles.wrapper}>
        <h2>Authorization</h2>
        <p className={styles.description}>
          SOURC3 is a decentralized platform. Therefore authorization is done
          <br />
          {' '}
          through a secret phrase.
          <br />
          In the next screen you will be presented with the twelve words.
        </p>
        <div className={styles.wrapperIcons}>
          <div className={styles.itemIcons}>
            <img src={IconLogoBlue} alt="icon" />
            <p>Do not let anyone see your secret phrase</p>
          </div>
          <div className={styles.itemIcons}>
            <img src={IconLogoHalf} alt="icon" />
            <p>Never type your secret phrase into password managers or elsewhere</p>
          </div>
          <div className={styles.itemIcons}>
            <img src={IconLogoAll} alt="icon" />
            <p>Keep the copies of your secret phrase in a safe place</p>
          </div>
        </div>
        <NavButton
          name="Show phrase"
          onClick={next}
          inlineStyles={{ width: '278px' }}
          active
        />
      </div>

    </>
  );
}

export default AuthInfo;
