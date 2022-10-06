import React from 'react';
import styles from '@components/shared/git-auth/profile/profiles-git.module.scss';
import Avatar from '@components/shared/git-auth/profile/avatar/avatar';
import early_joiner from '@assets/img/early_joiner.svg';
import lang_jscript from '@assets/img/lang_jscript.svg';
import default_achievemetns from '@assets/img/default_achievemetns.svg';
import { IAchievements } from '@types';

type AchievementsProps = {
  achievements: [IAchievements];
};

function Achievements({ achievements }:AchievementsProps) {
  const iconAchiev = (name:string) => {
    switch (name) {
      case 'early_joiner':
        return early_joiner;
      case 'lang_jscript':
        return lang_jscript;
      default:
        return default_achievemetns;
    }
  };

  return (
    <div className={styles.wrapperOrganization}>
      <span className={styles.title}>Achievements</span>
      <div className={styles.wrapperOrganization_avatar}>
        {achievements.map((el) => (
          <div className={styles.wrapp}>
            <Avatar achievements url={iconAchiev(el.type)} />
          </div>
        ))}
      </div>
    </div>

  );
}

export default Achievements;
