import React, { useEffect, useMemo, useState } from 'react';
import { IProfiles } from '@types';
import { Milestone } from '@components/shared/git-auth/profile/repository/components';
import styles from './gitSummary.module.scss';

function GitSummary({ profile }:gitSummaryType) {
  const [reputation, setReputation] = useState(0);
  const [stars, setStars] = useState(0);
  const [createdRepos, setCreatedRepos] = useState(0);
  const [forkedRepos, setForkedRepos] = useState(0);
  const [allCommits, setAllCommits] = useState(0);
  const [relisedOrgs, setRelisedOrgs] = useState(0);
  const [forkedHis, setForkedHis] = useState(0);
  const [allOrgs, setAllOrgs] = useState(0);
  const [relisedCount, setRelisedCount] = useState(0);
  const [mostPopularOrgRep, setMostPopularOrgRep] = useState(null);
  const [mostLanguages, setMostLanguages] = useState([{}]);
  const mostPopularOwnRep = profile && profile.github_repos.filter((el) => el.owner_login === profile.github_login).sort((a, b) => b.rating - a.rating).slice(0, 1);
  const topics = mostPopularOwnRep && mostPopularOwnRep[0].topics.slice(0, 3);
  const calcRepInORg = () => {
    if (profile.github_orgs) {
      const repOrg = [];
      for (let i = 0; i < profile.github_orgs.length; i++) {
        profile.github_repos.map((el) => {
          if (el.owner_login === profile.github_orgs[i].login) {
            repOrg.push(el);
          }
        });
      }
      const mostPopularRep = repOrg && repOrg.sort((a, b) => b.rating - a.rating);
      setMostPopularOrgRep(mostPopularRep);
      setRelisedOrgs(repOrg.filter((el) => el.user_releases_cnt).length);
      setRelisedCount(repOrg && repOrg.reduce((acc, rep) => acc + rep.user_releases_cnt, relisedCount));
      setAllOrgs(repOrg.length);
    }
  };

  function languagePopularitySlice(languageList, sliceSize) {
    const popularityMap = languageList.reduce(
      (map, { language, rate }) => ({
        ...map,
        [language]: language in map ? map[language] + rate : rate
      }),
      {}
    );

    const sortedPopularityMap = {};

    for (const language in popularityMap) {
      sortedPopularityMap[popularityMap[language]] = language;
    }

    return Object.keys(sortedPopularityMap)
      .reverse()
      .slice(0, sliceSize)
      .map((rate) => ({ language: sortedPopularityMap[rate], rate }));
  }

  const languages = () => {
    const langArray = [];
    profile.github_repos.map((item) => {
      item.user_languages.map((el) => {
        if (el.language) {
          langArray.push({ language: el.language, rate: (el.removed_lines_cnt + el.added_lines_cnt) });
        } if (el.renamed_files_cnt) {
          langArray.push({ language: 'Renamed files', rate: el.renamed_files_cnt });
        } if (el.languages) {
          langArray.push({
            language: el.languages.join(','),
            rate: (el.added_lines_cnt + el.removed_lines_cnt)
          });
        }
        return el;
      });
    });
    return setMostLanguages(languagePopularitySlice(langArray, 5));
  };

  useEffect(() => {
    setStars(profile.github_repos && profile.github_repos.reduce((acc, rep) => acc + rep.stargazers_count, reputation));
    setForkedRepos(profile.github_repos && profile.github_repos.reduce((acc, rep) => acc + (rep.fork ? 1 : 0), forkedRepos));
    setAllCommits(profile.github_repos && profile.github_repos.reduce((acc, rep) => acc + rep.user_commits_cnt, allCommits));
    setAllCommits(profile.github_repos && profile.github_repos.reduce((acc, rep) => acc + rep.user_commits_cnt, allCommits));
    setForkedHis(profile.github_repos && profile.github_repos.filter((el) => el.owner_login === profile.login).reduce((acc, rep) => acc + rep.forks_count, forkedHis));
  }, [profile.github_repos]);

  useMemo(() => {
    setCreatedRepos(profile.github_repos.length - forkedRepos);
    setReputation((allCommits * 10) + stars);

    calcRepInORg();
    languages();
  }, [forkedRepos, profile.github_repos, stars]);
  return (
    <div className={styles.wrapper}>
      <div className={styles.summary}>
        <div className={styles.blockLeft}>
          <div className={styles.resumeLeft}>
            <div className={styles.resumeLeft_wrapper}>
              <span className={styles.title}>
                {`${profile.github_repos.length} repositories`}
                <span className={styles.text}>
                  {
                    ` (${createdRepos} created, ${forkedRepos} forked)`
                  }
                </span>
              </span>
            </div>
            <div className={styles.resumeLeft_wrapper}>
              <span className={styles.title}>
                {`${forkedHis}`}
                <span className={styles.text}>
                  {' '}
                  forks from his repository
                </span>
              </span>
            </div>
            {mostPopularOwnRep[0].full_name && (
              <div className={styles.resumeLeft_wrapper}>
                <span className={styles.text}>
                  Most popular repository:
                  {' '}
                  <span className={styles.url}>
                    <a href={`https://github.com/${mostPopularOwnRep[0].full_name}`}>{mostPopularOwnRep[0].full_name}</a>
                  </span>
                </span>
              </div>
            )}

          </div>

          <div />
          <div />
        </div>
        <div className={styles.blockRight}>
          <div className={styles.resumeLeft_wrapper}>
            {allOrgs && profile.github_orgs.length && (
              <span
                className={styles.title}
              >
                {`${allOrgs} repositories in ${profile.github_orgs.length} organizations`}
              </span>
            )}
          </div>
          { relisedCount && relisedOrgs && (
            <div className={styles.resumeLeft_wrapper}>
              <span
                className={styles.title}
              >
                {relisedCount}
                {' '}
                <span className={styles.text}>
                  releases in
                  {' '}
                  <span className={styles.title}>{relisedOrgs}</span>
                  <span className={styles.text}>
                    {' '}
                    repositories
                  </span>
                </span>
              </span>
            </div>
          )}
          { mostPopularOrgRep && (
            <div className={styles.resumeLeft_wrapper}>
              <span
                className={styles.text}
              >
                Most popular repository:
                {' '}
                <a href={`https://github.com/${mostPopularOrgRep[0].full_name}`}>{mostPopularOrgRep[0].full_name}</a>
              </span>
            </div>
          )}
        </div>
      </div>
      <div className={styles.languages}>
        <span className={styles.title}>Languages:</span>
        {mostLanguages && mostLanguages.map((el) => (
          <Milestone title={el.language} key={`${window.crypto.randomUUID()}`} />
        ))}
      </div>
      <div className={styles.topics}>
        {topics && topics.map((el) => (
          <Milestone title={el} key={`${window.crypto.randomUUID()}`} />
        ))}
      </div>
    </div>
  );
}

type gitSummaryType = {
  profile: IProfiles,
};

export default GitSummary;