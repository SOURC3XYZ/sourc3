import React, {
} from 'react';
import { IconTwitter, IconCopy, IconLocation } from '@components/svg';
import { useSelector } from '@libs/redux';
import early_adopter_badge from '@assets/img/early_adopter_badge.svg';
import Avatar from '@components/shared/git-auth/profile/avatar/avatar';
import styles from './profiles-git.module.scss';

function GitProfile() {
  const {
    id, avatar_url, email, name, twitter_username, login, location
  } = useSelector((state) => state.profile.data);
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
            <Avatar url={avatar_url} />
          </div>
          <div className={styles.info}>
            {location && (
              <div className={styles.info_location}>
                <IconLocation className={styles.info_icon} />
                <span>{location}</span>
              </div>
            )}
          </div>
          <div className={styles.organizations} />
        </div>
        <div className={styles.main}>
          <div className={styles.mainHeader}>
            <div className={styles.name}>{name || login}</div>
            <div className={styles.social}>
              {twitter_username && (
                <a
                  target="_blank"
                  href={`https://twitter.com/${twitter_username}`}
                  rel="noreferrer"
                >
                  <IconTwitter />
                </a>
              )}
            </div>
          </div>
          <div className={styles.supHeader}>
            {login && <span>{login}</span>}
            {email && <span>{email}</span>}
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
          </div>
          <div className={styles.wrapperData}>
            {/* <UserData description={profile.user_description} /> */}
            <div className={styles.description}>
              <div className={styles.description_text}>
                {' '}
                <span className={styles.welcome}>
                  Thank you for joining the community that is shaping the new web
                  {' '}
                  <span className={styles.nick}>{login || name}</span>
                  {' '}
                  !
                </span>
                <br />
                <span>
                  You are the
                  {' '}
                  <b>566</b>
                  {' '}
                  th of
                  {' '}
                  <b>1,345</b>
                  {' '}
                  developers that have already claimed their repos.
                  {' '}
                </span>
                <br />
                <span>
                  As an early adopter,
                  you will receive benefits including exclusive airdrops,
                  and early access to new features and products.
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
