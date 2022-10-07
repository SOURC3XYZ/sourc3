/* eslint-disable react/no-danger */
import { IAchievements } from '@types';
import { useMemo } from 'react';
import { AchievementListItem } from './achievement-list-item';
import styles from './achievements.module.scss';

type AchievementListProps = {
  items: IAchievements[];
  globalInfo: {
    commits: number;
    lines: number;
  }
};

function AchievementList({ items, globalInfo }:AchievementListProps) {
  const achievements = useMemo(() => items.map((el) => (
    <AchievementListItem
      key={el.type}
      item={el}
      globalInfo={globalInfo}
    />
  )), [items]);

  return (
    <div className={styles.wrapper}>
      {achievements}
    </div>
  );
}

export default AchievementList;
