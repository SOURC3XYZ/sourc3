import React from 'react';
import IconSuccess from '@assets/icons/icon-success.svg';
import { NavButton } from '@components/shared';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './success.module.scss';

interface LocationState {
  restore: boolean
}

function Success() {
  const navigate = useNavigate();
  const location = useLocation().state as LocationState;

  const goMain = () => navigate('/repos/all/1');

  const title = location.restore ? 'restored' : 'created';
  return (
    <div className={styles.wrapper}>
      <h2>
        Account
        {' '}
        {title}
        {' '}
        successfully!
      </h2>
      <div className={styles.intro}>
        <img src={IconSuccess} alt="success-icon" />
      </div>
      <NavButton
        name="Get Started!"
        onClick={goMain}
        inlineStyles={{ width: '278px' }}
      />
    </div>
  );
}

export default Success;
