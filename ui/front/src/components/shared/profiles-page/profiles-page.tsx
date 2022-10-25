import React, {
} from 'react';
import {
  NavButton
} from '@components/shared';
// import Avatar from 'boring-avatars';
import {
  IconWebSite, IconDiscord, IconInstagram, IconLinkedIn, IconTelegram, IconTwitter, IconCopy
} from '@components/svg';
import UserData from '@components/shared/profiles/componets/userData';
import { useSelector } from '@libs/redux';
import DefaultAvatar from 'boring-avatars';
import { useNavigate } from 'react-router-dom';
import { compact, copyToClipboard } from '@libs/utils/string-handlers';
import Avatar from './avatar/avatar';
import styles from './profiles-page.module.scss';

function ProfilesPage() {
  const profile = useSelector((state) => state.sc3Frofile);
  const pkey = useSelector((state) => state.app.pkey);
  const navigate = useNavigate();
  const handlerEdit = () => {
    navigate('edit', { replace: false });
  };
  const compactId = compact(pkey, 8);
  const copyId = async () => {
    await copyToClipboard(profile.user_id);
  };
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.breadcrumbs} />
        <div className={styles.title}>
          <h3>Profile</h3>
          {pkey === profile.user_id && <NavButton name="Edit profile" onClick={handlerEdit} />}
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.side}>
          <div className={styles.avatar}>
            {!profile.user_avatar_ipfs_hash ? (<DefaultAvatar size={160} />) : (<Avatar />)}
          </div>
          <div className={styles.organizations} />
        </div>
        <div className={styles.main}>
          <div className={styles.mainHeader}>
            <div className={styles.name}>{profile.user_name}</div>
            <div className={styles.social}>
              {profile.user_website && (
                <a
                  target="_blank"
                  href={profile.user_website}
                  rel="noreferrer"
                >
                  <IconWebSite />
                </a>
              )}
              {profile.user_discord && (
                <a
                  target="_blank"
                  href={profile.user_discord}
                  rel="noreferrer"
                >
                  <IconDiscord />
                </a>
              )}
              {profile.user_twitter && (
                <a
                  target="_blank"
                  href={profile.user_twitter}
                  rel="noreferrer"
                >
                  <IconTwitter />
                </a>
              )}
              {profile.user_instagram && (
                <a
                  target="_blank"
                  href={profile.user_instagram}
                  rel="noreferrer"
                >
                  <IconInstagram />
                </a>
              )}
              {profile.user_linkedin && (
                <a
                  target="_blank"
                  href={profile.user_linkedin}
                  rel="noreferrer"
                >
                  <IconLinkedIn />
                </a>
              )}
              {profile.user_telegram && (
                <a
                  target="_blank"
                  href={profile.user_telegram}
                  rel="noreferrer"
                >
                  <IconTelegram />
                </a>
              )}
            </div>
          </div>
          <div className={styles.supHeader}>
            <span>{profile.user_nickname}</span>
            <span>{profile.user_email}</span>
            <span>
              {`id: ${compactId}`}
              <button
                type="button"
                onClick={copyId}
                className={styles.copyButton}
              >
                <IconCopy />
              </button>
            </span>
          </div>
          <div className={styles.wrapperData}>
            <UserData description={profile.user_description} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilesPage;
