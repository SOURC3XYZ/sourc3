import React, { useEffect } from 'react';
import {
  AllRepos,
  NavButton
} from '@components/shared';
import Avatar from 'boring-avatars';
import {
  IconWebSite, IconDiscord, IconInstagram, IconLinkedIn, IconTelegram, IconTwitter
} from '@components/svg';
import UserData from '@components/shared/profiles/componets/userData';
import { useDispatch, useSelector } from '@libs/redux';
import { AC, RC } from '@libs/action-creators';
import { ReposResp } from '@types';
import { useNavigate } from 'react-router-dom';
import styles from './profiles-page.module.scss';

function ProfilesPage() {
  const profile = useSelector((state) => state.profile);
  const pKey = profile.user_id;
  console.log(pKey);
  const navigate = useNavigate();
  const handlerEdit = () => {
    navigate(`edit`, { replace: false });
  };
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.breadcrumbs} />
        <div className={styles.title}>
          <h3>Profile</h3>
          <NavButton name="Edit profile" onClick={handlerEdit} />
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.side}>
          <div className={styles.avatar}>
            <Avatar size={160} />
          </div>
          <div className={styles.organizations} />
        </div>
        <div className={styles.main}>
          <div className={styles.mainHeader}>
            <div className={styles.name}>{profile.user_name}</div>
            <div className={styles.social}>
              <a target="_blank" href={profile.user_website} rel="noreferrer"><IconWebSite /></a>
              <a href={profile.user_discord}><IconDiscord /></a>
              <a href={profile.user_twitter}><IconTwitter /></a>
              <a href={profile.user_instagram}><IconInstagram /></a>
              <a href={profile.user_linkedin}><IconLinkedIn /></a>
              <a href={profile.user_telegram}><IconTelegram /></a>
            </div>
          </div>
          <div className={styles.supHeader}>
            <span>{profile.user_nickname}</span>
            <span>{profile.user_email}</span>
            <span>{`id: ${profile.user_id}`}</span>
          </div>
          <div className={styles.description}>
            <span>{profile.user_description}</span>
          </div>
          <div className="wrapperRepos">
            <UserData />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilesPage;
