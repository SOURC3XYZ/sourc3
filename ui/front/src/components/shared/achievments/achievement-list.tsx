/* eslint-disable react/no-danger */
import { IAchievements, LangGitData } from '@types';
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
  const allReposCount = items.filter((el) => (el.data as LangGitData)?.repos)
    .reduce((acc: number, cur) => acc + ((cur.data as LangGitData).repos.length) || 0, 0);
  const achievements = useMemo(() => items.map((el) => (
    <AchievementListItem
      key={el.type}
      item={el}
      globalInfo={{ ...globalInfo, repos: allReposCount }}
    />
  )), [items]);

  return (
    <div className={styles.wrapper}>
      {achievements}
    </div>
  );
}

export default AchievementList;
