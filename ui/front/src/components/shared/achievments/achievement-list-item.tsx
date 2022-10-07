/* eslint-disable react/no-danger */
import { IAchievements, LangGitData } from '@types';
import { useMemo } from 'react';
import Achievement from './achievement';
import { achievementsData } from './prog-lang-list';

type AchievementListItemProps = {
  item: IAchievements;
  globalInfo: {
    commits: number;
    lines: number;
  }
};

export function AchievementListItem({ item, globalInfo }: AchievementListItemProps) {
  const data = achievementsData.get(item.type);
  console.log('ITEM', item);
  const children = useMemo(() => {
    if (item.type === 'early_joiner') {
      return (
        <div
          dangerouslySetInnerHTML={{
            __html: `
          You are builder <span>#${item.user}</span> to join SOURC3`
          }}
        />
      );
    }
    const langData = item.data as LangGitData;
    const commitsPercent = ~~(100 / (globalInfo.commits / langData.commits_cnt));
    const linesPercent = ~~(100 / (globalInfo.lines / langData.added_lines_cnt));
    return (
      <>
        <div
          dangerouslySetInnerHTML={{
            __html: `
              <span>${langData.added_lines_cnt}</span> of lines written
              `
          }}
        />
        <div
          dangerouslySetInnerHTML={{
            __html: `
                <span>${langData.removed_lines_cnt}</span> of removed lines`
          }}
        />
        <div
          dangerouslySetInnerHTML={
            {
              __html: `
                  <span>${langData.commits_cnt}</span> commits`
            }
          }
        />
        <div
          dangerouslySetInnerHTML={
            {
              __html: `
                  <span>${commitsPercent}%</span> of commits in ${data?.title}`
            }
          }
        />
        <div
          dangerouslySetInnerHTML={
            {
              __html: `
                  <span>${linesPercent}%</span> of lines written are ${data?.title}`
            }
          }
        />
      </>
    );
  }, [item, globalInfo]);

  if (data) {
    return (
      <Achievement key={item.type} img={data.img} color={data.color} item={data}>
        {children}
      </Achievement>
    );
  } return null;
}
