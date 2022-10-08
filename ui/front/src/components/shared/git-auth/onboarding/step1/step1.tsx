import React, { useState } from 'react';
import { NavButton } from '@components/shared';
import axios from 'axios';
import { HOST } from '@components/shared/git-auth/profile/constants';
import { isEthAddress } from '@libs/utils';
import InputCustom from '../../../input/input';
import styles from './step.module.scss';

type Spep1Props = {
  callback: () => void;
};

function Step1({ callback }:Spep1Props) {
  const [address, setAddress] = useState('');
  const next = () => {
    callback();
  };
  const putAddress = (add:string) => {
    axios({
      method: 'put',
      url: `${HOST}/user/ethaddr`,
      withCredentials: false,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${window.localStorage.getItem('token')}`
      },
      data: add
    }).then((res) => {
      if (res.data) next();
    }).catch(() => {

    });
  };

  return (
    <div className={styles.section}>
      <div className={styles.step}>
        <div className={styles.content}>
          <h1>
            <span className={styles.color}>Future proof</span>
            {' '}
            your reputation and
            {' '}
            <span className={styles.drop}>bring it on-chain</span>
            {' '}
          </h1>
          <div className={styles.text}>
            <p>
              Ensure your reputation and contributions are attributed to you by
              <span className={styles.drop}>
                bringing them on-chain and associated to your wallet.
              </span>
            </p>
            <p>
              Connecting your wallet address also means we can airdrop SOURC3 rewards
              <span className={styles.drop}>and benefits directly.</span>
            </p>
            <p>Pop your Ethereum wallet address (hex or ENS) below:</p>
          </div>
          <div className={styles.input}>
            <InputCustom
              type="text"
              onChange={(e) => (setAddress(e.target.value))}
              valid={isEthAddress(address)}
              err={!isEthAddress(address) && address ? 'Address incorrect' : ''}
            />
            <NavButton
              name="Next"
              onClick={() => putAddress(address)}
              isDisabled={!isEthAddress(address)}
            />
          </div>
          <button
            type="button"
            onClick={callback}
            className={styles.skip}
          >
            Skip for now

          </button>
        </div>
      </div>
    </div>
  );
}

export default Step1;
