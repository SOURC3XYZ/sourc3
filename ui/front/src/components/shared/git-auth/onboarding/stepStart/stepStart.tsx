import early from '@assets/icons/early-adopter.svg';
import arrow from '@assets/icons/arrow2.svg';
import ellipse from '@assets/icons/ellipse.svg';
import { NavButton } from '@components/shared';
import React from 'react';
import { useSelector } from '@libs/redux';
import styles from './stepStart.module.scss';

function stepStart(props: any) {
  const { github_profile, github_login, id } = useSelector((state) => state.profile.data);

  return (
    <div className={styles.section}>
      <div className={styles.title}>
        <div className={styles.img}>
          <img className={styles.arrow} src={arrow} alt="" />
          <img className={styles.ellipse} src={ellipse} alt="" />
        </div>
        <h1>
          <span className={styles.indent}>
            {`${github_profile.name || github_login} , thank you ` }
          </span>
          <span className={styles.drop}>
            for joining
            <a href="@components/shared/git-auth/onboarding/stepHead/stepHead#">SOURC3</a>
            {' '}
            and
          </span>
          the community shaping
          {' '}
          <span className={styles.green}>the new web</span>
          !
        </h1>
        <img src={early} alt="early adopter" />
      </div>
      <div className={styles.count}>
        <h4>You are creator</h4>
        <div className={styles.countNum}><h4>{`#${id}`}</h4></div>
        <h4>to join sourc3</h4>
      </div>
      <div className={styles.text}>
        <p>
          <span className={styles.drop}>As an early adopter you will be eligible to receive exclusive benefits</span>
          {' '}
          including airdrops, and early access to new features and products.
        </p>
        <p>
          To enjoy the best SOURC3 experience, complete the following 3 steps:
          <span className={styles.drop}>
            <span className={styles.color}>future proof your reputation, join the community</span>
            {' '}
            and
            {' '}
            <span className={styles.color}>spread the word.</span>
          </span>
        </p>
      </div>
      <NavButton
        name="Get started"
        onClick={() => props.onClickHandler(2)}
      />
    </div>
  );
}

export default stepStart;
