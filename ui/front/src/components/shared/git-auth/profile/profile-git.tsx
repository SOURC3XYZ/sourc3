import React, { useEffect, useState } from 'react';
import {
  IconTwitter, IconCopy, IconLocation, IconOrg, IconFollows
} from '@components/svg';
import early_adopter_badge from '@assets/img/early_adopter_badge.svg';
import Avatar from '@components/shared/git-auth/profile/avatar/avatar';
import IconDefaultAvatar from '@components/svg/iconDefautlAvatar';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { HOST } from '@components/shared/git-auth/profile/constants';
import { useSelector } from '@libs/redux';
import { GitConnectAuth, GitOwnRepos } from '@components/shared/git-auth';
import { Popup } from '@components/shared/popup';
import MyLoader from '@components/shared/git-auth/profile/skeletonProfile';
import styles from './profiles-git.module.scss';
import Organizations from './organization';

function GitProfile() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const urlId = pathname.split('/profile/')[1];
  const [{
    github_profile, id, github_orgs, github_owned_repos
  }, setGitHubProfile] = useState([]);
  const [allUsers, setAllUsers] = useState(0);
  const [visiblePopup, setVisiblePopup] = useState(false);
  const checkStatus = (result:any) => {
    axios.get(`${HOST}/tasks/${result}`).then((task) => {
      switch (task.data.status) {
        case 'done': axios.get(`${HOST}/users/${urlId}`).then((res) => {
          setGitHubProfile(res.data);
        });
          break;
        case 'running':
        case 'delayed':
        case 'enqueued':
          setTimeout(() => { checkStatus(result); }, 30000);
          break;
        case 'failed':
        case 'skipped':
          window.localStorage.removeItem('token');
          setVisiblePopup(true);
          break;
        default: setTimeout(() => { checkStatus(result); }, 30000);
      }
    });
  };
  useEffect(() => {
    axios.get(`${HOST}/users/${urlId}`).then((res) => {
      setGitHubProfile(res.data);
      if (res.data.github_task) {
        axios.get(`${HOST}/tasks/${res.data.github_task}`).then((staskStatus) => {
          if (staskStatus.data.status === 'running') {
            setTimeout(() => { checkStatus(res.data.github_task); }, 30000);
          }
        });
      }
    })
      .catch((err) => err && navigate('/404'));
  }, [urlId]);

  useEffect(() => {
    axios.get(`${HOST}/stats/users`).then((res) => {
      setAllUsers(res.data.users_count);
    });
  }, []);

  return (
    <>
      {!github_profile ? <MyLoader /> : (
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
                {github_profile.avatar_url
                  ? <Avatar url={github_profile.avatar_url} /> : <IconDefaultAvatar />}
              </div>
              <div className={styles.sideBlock}>
                {' '}
                <div className={styles.info}>
                  {github_profile.company && (
                    <div className={styles.info_block}>
                      <IconOrg className={styles.info_icon} />
                      <span>{github_profile.company}</span>
                    </div>
                  )}
                  {github_profile.location && (
                    <div className={styles.info_block}>
                      <IconLocation className={styles.info_icon} />
                      <span>{github_profile.location}</span>
                    </div>

                  )}
                  <div className={styles.info_block}>
                    <IconFollows className={styles.info_icon} />
                    <div className={styles.info_block_followers}>
                      {github_profile.followers
                        ? <span>{`Followers: ${github_profile.followers}`}</span>
                        : <span>Followers: 0</span>}
                      {github_profile.following
                        ? <span>{`Following: ${github_profile.following}`}</span>
                        : <span>Following: 0</span>}
                      {github_profile.mutual_followers
          && <span>{`Mutual follows: ${github_profile.mutual_followers}`}</span>}
                    </div>
                  </div>
                </div>
                <div className={styles.organizations} />
                {github_orgs.length > 0 && <Organizations githubOrgs={github_orgs} />}
              </div>
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
                {urlId && (
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
                      <span
                        className={styles.nick}
                      >
                        {github_profile.login || github_profile.name}
                      </span>
                      {' '}
                      !
                    </span>
                    <br />
                    <span>
                      You are the
                      {' '}
                      <b>{id}</b>
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
              { github_owned_repos.length > 0 && <GitOwnRepos data={github_owned_repos} />}
            </div>
          </div>
        </div>
      )}
      <Popup
        visible={visiblePopup}
        title="Failed to connect with Github"
        onCancel={() => (setVisiblePopup(false))}
      >
        <GitConnectAuth name="Reconnect with Github" />
      </Popup>
    </>
  );
}

export default GitProfile;
