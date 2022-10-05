import early from '@assets/icons/early-adopter.svg';
import arrow from '@assets/icons/arrow2.svg';
import ellipse from '@assets/icons/ellipse.svg';
import { useSelector } from '@libs/redux';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { HOST } from '@components/shared/git-auth/profile/constants';
import styles from './stepHead.module.scss';

function StepHead() {
  const { github_login, id } = useSelector((state) => state.profile.data);
  const [allUsers, setAllUsers] = useState('0');
  useEffect(() => {
    axios.get(`${HOST}/stats/users`).then((res) => {
      setAllUsers(res.data.users_count);
    })
      .catch(() => {
        setAllUsers(id);
      });
  }, []);

  return (
    <div className={styles.section}>
      <div className={styles.title}>
        <div className={styles.img}>
          <img className={styles.arrow} src={arrow} alt="" />
          <img className={styles.ellipse} src={ellipse} alt="" />
        </div>
        <h1>
          <span className={styles.indent}>{`${github_login.toUpperCase()}, thank you`}</span>
          <span className={styles.drop}>
            for joining
            <a href="@components/shared/git-auth/onboarding/stepHead/stepHead#">SOURC3</a>
            {' '}
            and
          </span>
          the community shaping
          {' '}
          <span className={styles.green}>the new web!</span>
        </h1>
        <img src={early} alt="early adopter" />
      </div>
      <div className={styles.count}>
        <h4>You are creator</h4>
        <div className={styles.countNum}><h4>{`#${id}`}</h4></div>
      </div>
      <div className={styles.text}>
        <p>
          SOURC3 has a community of
          {' '}
          <span>{allUsers}</span>
          {' '}
          of creators who are building their reputation by bringing their contributions on-chain.
        </p>
        <p>As an early adopter and on-chain contributor, you will receive benefits including exclusive airdrops, and early access to new features and products.</p>
      </div>
    </div>
  );
}

export default StepHead;
