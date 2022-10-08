import React from 'react';
import { IconGitLogo, IconStar } from '@components/svg';
import { IGitRepos } from '@types';
import { List } from 'antd';
import moment from 'antd/node_modules/moment';
import { PullRequest, Milestone, Languages } from '@components/shared/git-auth/profile/repository/components';
import styles from './gitOwnRepos.module.scss';

type GitOwnReposType = {
  data: IGitRepos[]
};

function GitOwnRepos({ data }:GitOwnReposType) {
  const sortData = data && data.sort((a, b) => b.rating - a.rating);
  function formatDateTime(dateTime: string, formatString = 'LL') {
    return moment(new Date(dateTime)).format(formatString);
  }
  const getPercent = (total:number, own:number) => +((own / total) * 100).toFixed(1);
  const minTimeContr = (fC:string, fPr: string, cr:string) => {
    const firstCommit = fC || null;
    const firstPr = fPr || null;
    const created = cr;

    if (firstCommit && firstPr && firstCommit !== firstPr) {
      return firstCommit < firstPr ? formatDateTime(firstCommit) : formatDateTime(firstPr);
    } if (!firstCommit && !firstPr) {
      return formatDateTime(created);
    } if (!firstPr && firstCommit) {
      return formatDateTime(firstCommit);
    } if (!firstCommit && firstPr) {
      return formatDateTime(firstPr);
    }
    return formatDateTime(firstCommit);
  };
  const maxTimeContr = (lC:string, lPr:string, cr:string) => {
    const lastCommit = lC || null;
    const lastPr = lPr || null;
    const created = cr;
    if (lastCommit && lastPr && lastCommit !== lastPr) {
      return lastCommit > lastPr ? formatDateTime(lastCommit) : formatDateTime(lastPr);
    } if (!lastCommit && !lastPr) {
      return formatDateTime(created);
    } if (!lastPr && lastCommit) {
      return formatDateTime(lastCommit);
    } if (!lastCommit && lastPr) {
      return formatDateTime(lastPr);
    }
    return formatDateTime(lastCommit);
  };
  console.log(data);
  return (
    <List
      dataSource={sortData}
      pagination={{
        pageSize: 5
      }}
      loading={!sortData}
      renderItem={(rep) => (
        <div className={styles.wrapper} key={rep.id}>
          <div className={styles.header}>
            <IconGitLogo />
          </div>
          <div className={styles.block}>
            <div className={styles.block_left}>
              <div className={styles.wrapper_title}>
                <div className={styles.name}>
                  <a
                    target="_blank"
                    href={`https://github.com/${rep.full_name}`}
                    rel="noreferrer"
                  >
                    {rep.full_name}
                  </a>
                </div>
                <div className={styles.stargazers}>
                  <IconStar />
                  {' '}
                  {rep.stargazers_count}
                </div>
              </div>

              <div className={styles.forked}>
                {rep.fork && (
                  <div className={styles.forked_from}>
                    <span>
                      Forked from
                      {' '}
                      <span>
                        <a
                          target="_blank"
                          href={`https://gitgub.com/${rep.parent}`}
                          rel="noreferrer"
                        >
                          {rep.parent}
                        </a>
                      </span>
                    </span>
                    <div className={styles.stargazers}>
                      <IconStar />
                      {' '}
                      <span>{rep.parent_stargazers_count}</span>
                    </div>
                  </div>
                )}
                <div className={styles.forked_date}>
                  {rep.fork ? 'Forked on' : 'Created on'}
                  {' '}
                  <span>{formatDateTime(rep.github_created_at)}</span>
                </div>
                {rep.user_commits_cnt ? (
                  <div className={styles.topContr}>
                    <Milestone
                      title={rep.user_committers_pos === 1 ? ' Top contributor' : `${rep.user_committers_pos}${rep.user_committers_pos === 2 ? 'nd' : rep.user_committers_pos === 3 ? 'rd' : rep.user_committers_pos === 21 ? 'st' : 'th'} contributor out of ${rep.total_committers_cnt}`}
                    />
                  </div>
                ) : null}
              </div>

            </div>
            <div className={styles.block_right}>
              <div className={styles.contribution}>
                Contribution period:
                {' '}
                <span>{minTimeContr(rep.user_first_commit_time, rep.user_first_pr_time, rep.github_created_at) === maxTimeContr(rep.user_last_commit_time, rep.user_last_pr_time, rep.github_updated_at) ? null : `${minTimeContr(rep.user_first_commit_time, rep.user_first_pr_time, rep.github_created_at)} - `}</span>
                <span>{maxTimeContr(rep.user_last_commit_time, rep.user_last_pr_time, rep.github_updated_at)}</span>
              </div>
              {rep.total_commits_cnt ? (
                <div
                  className={styles.commits}
                >
                  {`${rep.user_commits_cnt} commit${rep.user_commits_cnt > 1 ? 's' : ''} (out of ${rep.total_commits_cnt}, ${getPercent(rep.total_commits_cnt, rep.user_commits_cnt)}%)`}
                </div>
              ) : (
                <div
                  className={styles.commits}
                >
                  No commits in the repository
                </div>
              )}
              <PullRequest
                total={rep.user_total_prs_cnt}
                accepted={rep.user_accepted_prs_cnt}
                pending={rep.user_pending_prs_cnt}
                rejected={rep.user_rejected_prs_cnt}
              />
              <div className={styles.releases}>
                <span>{`Releases: ${rep.user_releases_cnt}`}</span>
                <span>{`${rep.total_releases_cnt}`}</span>
              </div>
              {rep.user_languages && <Languages data={rep.user_languages} />}
            </div>
          </div>
        </div>
      )}
    />
  );
}

export default GitOwnRepos;
