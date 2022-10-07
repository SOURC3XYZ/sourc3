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
    repos: number;
  }
};

function getHoursDiff(startDate: number, endDate: number) {
  const msInHour = 1000 * 60 * 60;

  return Math.round(Math.abs(endDate - startDate) / msInHour);
}

export function AchievementListItem({ item, globalInfo }: AchievementListItemProps) {
  const data = achievementsData.get(item.type);
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
    const linesPercent = ~~(100 / (
      globalInfo.lines / (langData.added_lines_cnt + langData.removed_lines_cnt)
    ));
    const reposPercent = ~~(100 / (
      globalInfo.repos / langData.repos.length
    ));
    const hoursDiff = getHoursDiff(
      new Date(langData.first_commit_time).getTime(),
      new Date(langData.last_commit_time).getTime()
    );
    return (
      <>
        <div
          dangerouslySetInnerHTML={
            {
              __html: `
                  <span>${commitsPercent}%</span> of commits in ${data?.title}`
            }
          }
        />
        <div
          dangerouslySetInnerHTML={{
            __html: `
              <span>${langData.added_lines_cnt}</span> of lines written are ${data?.title}
              `
          }}
        />

        <div
          dangerouslySetInnerHTML={{
            __html: `
              <span>${hoursDiff} hours</span> spent coding ${data?.title}
              `
          }}
        />

        <div style={{ background: 'rgba(0, 0, 0, 0.1)', height: '1px' }} />

        <div
          dangerouslySetInnerHTML={
            {
              __html: `
                  <span>${linesPercent}%</span> of lines written are ${data?.title}`
            }
          }
        />
        <div
          dangerouslySetInnerHTML={
            {
              __html: `
                  <span>${reposPercent}%</span> of projects`
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
