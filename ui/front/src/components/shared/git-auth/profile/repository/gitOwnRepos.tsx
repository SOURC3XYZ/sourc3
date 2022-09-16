import React from 'react';
import { IconGitLogo, IconStar } from '@components/svg';
import { IGitRepos } from '@types';
import { List } from 'antd';
import Milestone from '@components/shared/git-auth/profile/repository/milestone/milestone';
import moment from 'antd/node_modules/moment';
import styles from './gitOwnRepos.module.scss';

type GitOwnReposType = {
  data: [IGitRepos]
};

function GitOwnRepos({ data }:GitOwnReposType) {
  function formatDateTime(dateTime: string, formatString = 'DD.MM.YYYY') {
    return moment(new Date(dateTime)).format(formatString);
  }
  const getPercent = (total:number, own:number) => +((own / total) * 100).toFixed(1);

  return (
    <List
      dataSource={data}
      pagination={{
        pageSize: 5
      }}
      loading={!data}
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

              {rep.fork && (
                <div className={styles.forked}>

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
                  <div className={styles.forked_date}>
                    Forked on
                    {' '}
                    <span>{formatDateTime(rep.created_at)}</span>
                  </div>
                </div>
              )}

            </div>
            <div className={styles.block_right}>
              <div className={styles.contribution}>
                Contribution period:
                {' '}
                <span>{`${formatDateTime(rep.created_at)}-${formatDateTime(rep.pushed_at)}`}</span>
              </div>
              <div
                className={styles.commits}
              >
                {`${rep.user_commits_cnt} commit${rep.user_commits_cnt > 1 ? 's' : ''} (out of ${rep.total_commits_cnt}, ${getPercent(rep.total_commits_cnt, rep.user_commits_cnt)}%)`}
              </div>
              {rep.language && (
                <div className={styles.langStone}>
                  <Milestone title={rep.language} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    />
  );
}

export default GitOwnRepos;
