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
import { GitConnectAuth, GitOwnRepos } from '@components/shared/git-auth';
import { Popup } from '@components/shared/popup';
import MyLoader from '@components/shared/git-auth/profile/skeletonProfile';
import { Spin } from 'antd';
import { useSelector } from '@libs/redux';
import GitSummary from '@components/shared/git-auth/profile/gitSummary/gitSummary';
import { IProfiles } from '@types';
import { Preload } from '@components/shared';
import EarlyDescription from '@components/shared/git-auth/profile/earlyAdop/EarlyDescription';
import Achievements from '@components/shared/git-auth/profile/achievements/achievements';
import { compact, copyToClipboard } from '@libs/utils';
import styles from './profileGit.module.scss';
import Organizations from './organization';
import { Header } from '../../../../apps/web/components/header';
import { Footer } from '../../../../apps/web/components/footer';

function ProfileGit() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const urlId = pathname.split('/profile/')[1];
  const [gitProfiles, setGitHubProfile] = useState<IProfiles | undefined>(undefined);
  const [visiblePopup, setVisiblePopup] = useState(false);
  const [taskStatus, setTaskStatus] = useState(false);
  const shortAddress = gitProfiles?.eth_address && compact(gitProfiles?.eth_address, 6);
  console.log(shortAddress);
  const own = useSelector((state) => state.profile.data.github_login);
  const copy = (cop) => {
    copyToClipboard(cop);
  };
  const checkStatus = (result:any) => {
    axios.get(`${HOST}/tasks/${result}`).then((task) => {
      switch (task.data.status) {
        case 'done': axios.get(`${HOST}/users/${urlId}`).then((res) => {
          setGitHubProfile(res.data);
          console.log(res.data.status);
          setTaskStatus(true);
        });
          break;
        case 'running':
        case 'delayed':
          setTaskStatus(false);
          setTimeout(() => { checkStatus(result); }, 30000);
          break;
        case 'failed':
        case 'skipped':
          setTaskStatus(false);
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
          if (staskStatus.data.status === 'done') {
            setTaskStatus(true);
          } else {
            checkStatus(res.data.github_task);
            setTaskStatus(false);
          }
        });
      }
    })
      .catch((err) => err && navigate('/404'));
  }, [urlId]);

  return (
    <>
      <div className={styles.appWrapper}>
        <Header isOnLending={false} />
        {!gitProfiles ? <MyLoader />
          : (
            <div className={styles.wrapper}>
              <div className={styles.content}>
                <div className={styles.header}>
                  <div className={styles.mainHeader}>
                    <div className={styles.name}>{gitProfiles?.github_profile.name || gitProfiles?.github_profile.login}</div>
                    <div className={styles.supHeader}>
                      {gitProfiles?.github_profile.login && <span>{gitProfiles?.github_profile.login}</span>}
                      {gitProfiles?.github_profile.email && <span>{gitProfiles?.github_profile.email}</span>}
                      {shortAddress && (
                        <span>
                          {shortAddress}
                          {' '}
                          <button
                            type="button"
                            onClick={() => copy(gitProfiles?.eth_address)}
                            className={styles.copyButton}
                          >
                            <IconCopy />
                          </button>
                        </span>
                      )}
                    </div>
                  </div>

                </div>
                <div className={styles.topContent}>
                  <div className={styles.avatar}>
                    {gitProfiles?.github_profile.avatar_url
                      ? <Avatar url={gitProfiles?.github_profile.avatar_url} /> : <IconDefaultAvatar />}
                  </div>
                  {!taskStatus ? (
                    <div className={styles.preloader}>
                      <EarlyDescription gitProfiles={gitProfiles} />
                      <Preload messageBlack message="This may take a while..." />
                    </div>
                  )
                    : (
                      <GitSummary
                        profile={gitProfiles}
                      />
                    )}
                </div>
                <div className={styles.org}>
                  {gitProfiles.github_orgs && taskStatus && <Organizations githubOrgs={gitProfiles.github_orgs} />}
                </div>
                <div className={styles.org}>
                  {gitProfiles.achievements && taskStatus && <Achievements achievements={gitProfiles.achievements} />}
                </div>
              </div>
            </div>
          )}
      </div>
      <Footer isOnLending={false} profile />
    </>
  );
}

export default ProfileGit;
