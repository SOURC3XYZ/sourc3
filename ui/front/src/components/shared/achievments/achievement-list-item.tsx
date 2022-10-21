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
          dangerouslySetInnerHTML={
            {
              __html: `
                  <span>${linesPercent}%</span> of lines written are in ${data?.title}`
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

        <div style={{ background: 'rgba(0, 0, 0, 0.1)', height: '1px' }} />

        <div
          dangerouslySetInnerHTML={{
            __html: `
              <span>${(langData.commits_cnt).toLocaleString('en')}</span> ${
        langData.commits_cnt === 1 ? 'commit' : 'commits'
      } in ${data?.title}
              `
          }}
        />

        <div
          dangerouslySetInnerHTML={{
            __html: `
              <span>${
      (langData.added_lines_cnt).toLocaleString('en')}</span> of lines written are in ${data?.title}
              `
          }}
        />

        <div
          dangerouslySetInnerHTML={{
            __html: `
              <span>${(langData.repos.length).toLocaleString('en')}</span> ${
        langData.repos.length === 1 ? 'project' : 'projects'
      }`
          }}
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
