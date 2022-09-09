import React, { useEffect, useState } from 'react';
import { IconTwitter, IconCopy, IconLocation } from '@components/svg';
import { useSelector } from '@libs/redux';
import early_adopter_badge from '@assets/img/early_adopter_badge.svg';
import Avatar from '@components/shared/git-auth/profile/avatar/avatar';
import IconDefaultAvatar from '@components/svg/iconDefautlAvatar';
import axios from 'axios';
import styles from './profiles-git.module.scss';

function GitProfile() {
  const {
    id, github_profile
  } = useSelector((state) => state.profile.data);

  const [allUsers, setAllUsers] = useState(0);

  useEffect(() => {
    axios.get('https://poap-api.sourc3.xyz/stats/users').then((res) => {
      setAllUsers(res.data.users_count);
    });
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.breadcrumbs} />
        <div className={styles.title}>
          <h3>Profile</h3>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.side}>
          <div className={styles.avatar}>
            {github_profile.avatar_url ? <Avatar url={github_profile.avatar_url} /> : <IconDefaultAvatar /> }
          </div>
          <div className={styles.info}>
            {github_profile.location && (
              <div className={styles.info_location}>
                <IconLocation className={styles.info_icon} />
                <span>{github_profile.location}</span>
              </div>
            )}
          </div>
          <div className={styles.organizations} />
        </div>
        <div className={styles.main}>
          <div className={styles.mainHeader}>
            <div className={styles.name}>{github_profile.name || github_profile.login}</div>
            <div className={styles.social}>
              {github_profile.twitter_username && (
                <a
                  target="_blank"
                  href={`https://twitter.com/${github_profile.twitter_username}`}
                  rel="noreferrer"
                >
                  <IconTwitter />
                </a>
              )}
            </div>
          </div>
          <div className={styles.supHeader}>
            {github_profile.login && <span>{github_profile.login}</span>}
            {github_profile.email && <span>{github_profile.email}</span>}
            {id && (
              <span>
                id:
                {' '}
                {id}
                {' '}
                <button
                  type="button"
                  // onClick={copyId}
                  className={styles.copyButton}
                >
                  <IconCopy />
                </button>
              </span>
            )}
          </div>
          <div className={styles.wrapperData}>
            {/* <UserData description={profile.user_description} /> */}
            <div className={styles.description}>
              <div className={styles.description_text}>
                {' '}
                <span className={styles.welcome}>
                  Thank you for joining the community that is shaping the new
                  web
                  {' '}
                  <span className={styles.nick}>{github_profile.login || github_profile.name}</span>
                  {' '}
                  !
                </span>
                <br />
                <span>
                  You are the
                  {' '}
                  <b>{id + 687}</b>
                  {' '}
                  th of
                  {' '}
                  <b>{allUsers + 687}</b>
                  {' '}
                  developers that have
                  already claimed their repos.
                  {' '}
                </span>
                <br />
                <span>
                  As an early adopter, you will receive benefits including
                  exclusive airdrops, and early access to new features and
                  products.
                </span>
              </div>
              <img
                className={styles.description_img}
                src={early_adopter_badge}
                alt="early_adopter_badge"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GitProfile;
