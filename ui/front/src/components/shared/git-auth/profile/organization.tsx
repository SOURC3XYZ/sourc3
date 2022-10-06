import React from 'react';
import Avatar from '@components/shared/git-auth/profile/avatar/avatar';
import { IGitOrgs } from '@types';
import styles from './profiles-git.module.scss';

type OrganizationProps = {
  githubOrgs: [IGitOrgs];
};
function Organization({ githubOrgs }: OrganizationProps) {
  // const githubOrgs = useSelector((state) => state.profile.data.github_orgs);
  return (
    <div className={styles.wrapperOrganization}>
      <span className={styles.title}>Organizations</span>
      <div className={styles.wrapperOrganization_avatar}>
        {githubOrgs.map((el) => (
          <a
            key={el.id}
            href={`https://github.com/${el.login}`}
            target="_blank"
            rel="noreferrer"
          >
            <div className={styles.wrapp}>
              <Avatar medium url={el.avatar_url} />
              <div className={styles.label}>{el.login}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export default Organization;
