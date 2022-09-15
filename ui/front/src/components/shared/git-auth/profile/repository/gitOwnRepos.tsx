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
  const getProcent = (total:number, own:number) => {
    console.log(total);
    console.log(own);
    return +((own / total) * 100).toFixed(1);
  };

  return (
    <List
      dataSource={data}
      pagination={{
        onChange: (page) => {
          console.log(page);
        },
        pageSize: 5
      }}
      renderItem={(rep) => (
        <div className={styles.wrapper} key={rep.id}>
          <div className={styles.header}>
            <IconGitLogo />
          </div>
          <div className={styles.block}>
            <div className={styles.block_left}>
              <div className={styles.wrapper_title}>
                <div className={styles.name}>{rep.full_name}</div>
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
                      <span>{rep.parent}</span>
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
              <div className={styles.commits}>{`${rep.owner_commits_cnt} commit${rep.owner_commits_cnt > 1 ? 's' : ''} (out of ${rep.total_commits_cnt}, ${getProcent(rep.total_commits_cnt, rep.owner_commits_cnt)}%)`}</div>
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
