import React, { useEffect, useMemo, useState } from 'react';
import { IconCopy } from '@components/svg';
import Avatar from '@components/shared/git-auth/profile/avatar/avatar';
import IconDefaultAvatar from '@components/svg/iconDefautlAvatar';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { HOST } from '@components/shared/git-auth/profile/constants';
import { GitOwnRepos } from '@components/shared/git-auth';
import MyLoader from '@components/shared/git-auth/profile/skeletonProfile';
import GitSummary from '@components/shared/git-auth/profile/gitSummary/gitSummary';
import { IProfiles } from '@types';
import { AchievementList, Preload } from '@components/shared';
import EarlyDescription from '@components/shared/git-auth/profile/earlyAdop/EarlyDescription';
import { compact, copyToClipboard } from '@libs/utils';
import Mane from '@components/shared/git-auth/profile/mane/mane';
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
  const copy = (cop) => {
    copyToClipboard(cop);
  };
  const checkStatus = (result:any) => {
    axios.get(`${HOST}/tasks/${result}`).then((task) => {
      switch (task.data.status) {
        case 'done': axios.get(`${HOST}/users/${urlId}`).then((res) => {
          setGitHubProfile(res.data);
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
    axios.get(`${HOST}/users/${urlId}`)
      .then((res) => {
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

  const linesSumm = useMemo(() => (gitProfiles
    ? gitProfiles.github_profile.added_lines_cnt + gitProfiles.github_profile.removed_lines_cnt
    : 0
  ), [gitProfiles]);

  return (
    <>
      <div className={styles.appWrapper}>
        <Header isOnLending={false} />
        {!gitProfiles ? <Preload messageBlack="Loading..." />
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
                <div className={styles.wrapperContent}>
                  <div className={styles.leftSide}>
                    {' '}
                    <div className={styles.avatar}>
                      {gitProfiles?.github_profile.avatar_url
                        ? <Avatar url={gitProfiles?.github_profile.avatar_url} /> : <IconDefaultAvatar />}
                    </div>
                    {gitProfiles.github_orgs.length > 0 && taskStatus && <Organizations githubOrgs={gitProfiles.github_orgs} />}
                  </div>
                  <div className={styles.topContent}>

                    {!taskStatus ? (
                      <div className={styles.preloader}>
                        <EarlyDescription gitProfiles={gitProfiles} />
                        <Preload messageBlack message="This may take a while..." />
                      </div>
                    )
                      : gitProfiles?.github_repos.length > 0
                        ? (
                          <GitSummary
                            profile={gitProfiles}
                          />
                        )
                        : (<EarlyDescription gitProfiles={gitProfiles} />)}
                    <Mane
                      first={(
                        <AchievementList
                          globalInfo={{
                            commits: gitProfiles.github_profile.user_commits_cnt,
                            lines: linesSumm
                          }}
                          items={gitProfiles.achievements}
                        />
                      )}
                      second={<GitOwnRepos data={gitProfiles.github_repos} />}
                    />

                  </div>
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
