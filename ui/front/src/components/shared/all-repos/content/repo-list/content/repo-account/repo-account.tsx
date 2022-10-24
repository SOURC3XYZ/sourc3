import React from 'react';
import avatarL from '@assets/img/avatar-large.png';
import language from '@assets/img/language.svg';
import discord from '@assets/img/discord.svg';
import twitter from '@assets/img/twitter.svg';
import instagram from '@assets/img/instagram.svg';
import linkedin from '@assets/img/linkedin.svg';
import telegram from '@assets/img/telegram.svg';
import styles from './repo-account.module.scss';

function RepoAccount() {
  return (
    <div className={styles.repoAccount}>
      <div className={styles.list}>
        <div className={styles.block}>
          <div className={styles.logo}><img src={avatarL} alt="" /></div>
          <div className={styles.title}>
            <div>
              <h1>Organization name</h1>
              <h4>Organization description</h4>
            </div>
            <p className={styles.status}>private</p>
          </div>
        </div>
        <div className={styles.social}>
          <a href="#"><img src={language} alt="" /></a>
          <a href="#"><img src={discord} alt="" /></a>
          <a href="#"><img src={twitter} alt="" /></a>
          <a href="#"><img src={instagram} alt="" /></a>
          <a href="#"><img src={linkedin} alt="" /></a>
          <a href="#"><img src={telegram} alt="" /></a>
        </div>
      </div>
      <div className={styles.counts}>
        <div className={styles.countsItem}>
          <h4>Repositories</h4>
          <p className={styles.countsNum}>3</p>
        </div>
        <div className={styles.countsItem}>
          <h4>Issues</h4>
          <p className={styles.countsNum}>333</p>
        </div>
        <div className={styles.countsItem}>
          <h4>Contributors</h4>
          <p className={styles.countsNum}>55</p>
        </div>
        <div className={styles.countsItem}>
          <h4>Fork</h4>
          <p className={styles.countsNum}>233</p>
        </div>
        <div className={styles.countsItem}>
          <h4>Pull requests</h4>
          <p className={styles.countsNum}>87</p>
        </div>
      </div>
    </div>
  );
}
export default RepoAccount;
