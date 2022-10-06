import React, { useState } from 'react';
import { NavButton } from '@components/shared';
import axios from 'axios';
import { HOST } from '@components/shared/git-auth/profile/constants';
import web3 from 'web3';
import InputCustom from '../../../input/input';
import styles from './step.module.scss';

function Step1(props: any) {
  const [address, setAddress] = useState('');
  const next = () => {
    props.onClickHandler(3);
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
      if (res.data) {
        next();
      }
    });
  };

  return (
    <div className={styles.section}>
      <div className={styles.step}>
        <div className={styles.content}>
          <h4>NEXT STEPS</h4>
          <h2>
            <span className={styles.color}>Future proof</span>
            {' '}
            your reputation and
            {' '}
            <span className={styles.drop}>bring it on-chain</span>
            {' '}
          </h2>
          <div className={styles.text}>
            <p>
              Ensure your reputation and contributions are attributed to you by
              <span className={styles.drop}>bringing them on-chain and associated to your wallet.</span>
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
              placeholder="Pop your Ethereum wallet address (hex or ENS) below"
              onChange={(e) => (setAddress(e.target.value))}
              valid={web3.utils.isAddress(address)}
              err={!web3.utils.isAddress(address) && address ? 'Address incorrect' : ''}
            />
            <NavButton
              name="Next"
              onClick={() => putAddress(address)}
              isDisabled={!web3.utils.isAddress(address)}
            />
          </div>
          <button onClick={() => props.onClickHandler(3)} className={styles.skip}>Skip for now</button>
        </div>
      </div>
    </div>
  );
}

export default Step1;
