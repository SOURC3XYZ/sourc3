import React, { useEffect, useState } from 'react';
import early_adopter_badge from '@assets/img/early_adopter_badge.svg';
import { IProfiles } from '@types';
import axios from 'axios';
import { HOST } from '@components/shared/git-auth/profile/constants';
import styles from './EarlyDescription.module.scss';

type EayrlyType = {
  gitProfiles: IProfiles
};

function EarlyDescription({ gitProfiles }:EayrlyType) {
  const [allUsers, setAllUsers] = useState(0);

  useEffect(() => {
    axios.get(`${HOST}/stats/users`).then((res) => {
      setAllUsers(res.data.users_count);
    });
  }, []);
  return (
      <div className={styles.wrapperData}>
    <div className={styles.description}>
      <div className={styles.description_text}>
        {' '}
        <span className={styles.welcome}>
          Thank you for joining the community that is shaping the new web
          {' '}
          <span
            className={styles.nick}
          >
            {gitProfiles?.github_profile.login || gitProfiles?.github_profile.login}
          </span>
          {' '}
          !
        </span>
        <br />
        <div>
          <span>
            You are the
            {' '}
            <b>{gitProfiles?.id}</b>
            {' '}
            th of
            {' '}
            <b>{allUsers}</b>
            {' '}
            developers that have
            already claimed their repos.
            {' '}
          </span>
          <br />
          <span>
            As an early adopter, you will receive benefits including
            exclusive airdrops, and early
            <br />
            {' '}
            access to new features and
            products.
          </span>
        </div>
      </div>
      <img
        className={styles.description_img}
        src={early_adopter_badge}
        alt="early_adopter_badge"
      />
    </div>
      </div>
  );
}

export default EarlyDescription;
