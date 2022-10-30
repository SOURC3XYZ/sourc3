import React, { useEffect, useState } from 'react';
import { IGitRepos, IProfiles } from '@types';
import { Milestone } from '@components/shared/git-auth/profile/repository/components';
import { copyToClipboard } from '@libs/utils';
import message from 'antd/lib/message';
import styles from './gitSummary.module.scss';
import {useSelector} from "@libs/redux";

function GitSummary({ profile }:gitSummaryType) {
  const login = useSelector((state) => state.profile.data.github_login);
  const [reputation, setReputation] = useState(0);
  const [stars, setStars] = useState(0);
  const [createdRepos, setCreatedRepos] = useState(0);
  const [forkedRepos, setForkedRepos] = useState(0);
  const [allCommits, setAllCommits] = useState(0);
  const [relisedOrgs, setRelisedOrgs] = useState(0);
  const [forkedHis, setForkedHis] = useState(0);
  const [allOrgs, setAllOrgs] = useState(0);
  const [relisedCount, setRelisedCount] = useState(0);
  const [reliasedRep, setReliasedRep] = useState(0);
  const [reliasedRepCount, setReliasedRepCount] = useState(0);
  const [allOwnRepos, setAllOwnRepos] = useState(0);
  const [topics, setTopics] = useState<[] | number>(0);
  const [cntOrg, setCntOrg] = useState(0);
  const [repInOrg, setRepInORG] = useState(0);
  const [mostPopularOrgRep, setMostPopularOrgRep] = useState<[IGitRepos] | undefined>(undefined);
  const [mostLanguages, setMostLanguages] = useState<[] | undefined>(undefined);
  const mostPopularOwnRep = profile && profile.github_repos.filter((el) => el.owner_login === profile.github_login).sort((a, b) => b.rating - a.rating).slice(0, 1);

  const getPercent = (total:number, own:number) => +((own / total) * 100).toFixed(1);

  const getTopics = () => {
    if (profile.github_repos) {
      setTopics(profile && profile.github_repos.sort((a, b) => b.rating - a.rating).slice(0, 1)[0].topics);
    }
  };

  function languagePopularitySlice(languageList) {
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
      .map((rate) => ({ language: sortedPopularityMap[rate], rate }))
      .filter((el) => el.rate > 0.5 && el.language !== 'Renamed files' && el.language !== 'Other')
      .sort((a, b) => b.rate - a.rate);
  }
  const calcRepInORg = () => {
    if (profile.github_repos) {
      const orgRep = profile.github_repos.filter((el) => el.owner_login !== profile.github_login);
      const repIn = orgRep.filter((el) => el.org_repo);
      setRepInORG(repIn.length);
      setAllOrgs(orgRep.length);
      setRelisedCount(repIn && repIn.reduce((acc, rep) => acc + rep.user_releases_cnt, 0));
      setRelisedOrgs(repIn && repIn.filter((el) => el.user_releases_cnt).length);
      if (orgRep.length) {
        setMostPopularOrgRep(profile && profile.github_repos.filter((el) => el.owner_login !== profile.github_login).sort((a, b) => b.rating - a.rating).slice(0, 1));
      }
      const popularityMap = repIn.reduce(
        (map, { owner_login, rate }) => ({
          ...map,
          [owner_login]: owner_login in map
        }),
        {}
      );
      setCntOrg(Object.keys(popularityMap).length);
    }
  };
  const languages = () => {
    const langArray = [];
    profile.github_repos.map((item) => {
      item.user_languages.map((el) => {
        if (el.language) {
          langArray.push({ language: el.language, rate: getPercent((profile.github_profile.added_lines_cnt + profile.github_profile.removed_lines_cnt), (el.removed_lines_cnt + el.added_lines_cnt)) });
        } if (el.renamed_files_cnt) {
          langArray.push({ language: 'Renamed files', rate: el.renamed_files_cnt });
        } if (el.languages) {
          langArray.push({
            language: el.languages.slice(0, 1).join(','),
            rate: getPercent((profile.github_profile.added_lines_cnt + profile.github_profile.removed_lines_cnt), (el.removed_lines_cnt + el.added_lines_cnt))
          });
        }
        return el;
      });
    });
    return setMostLanguages(languagePopularitySlice(langArray));
  };

  useEffect(() => {
    setStars(profile.github_repos && profile.github_repos.reduce((acc, rep) => acc + rep.stargazers_count, reputation));
    setForkedRepos(profile.github_repos && profile.github_repos.reduce((acc, rep) => acc + (rep.fork ? 1 : 0), forkedRepos));
    setAllCommits(profile.github_repos && profile.github_repos.reduce((acc, rep) => acc + rep.user_commits_cnt, allCommits));
    setAllCommits(profile.github_repos && profile.github_repos.reduce((acc, rep) => acc + rep.user_commits_cnt, allCommits));
    setForkedHis(profile.github_repos && profile.github_repos.filter((el) => el.owner_login === profile.github_login).reduce((acc, rep) => acc + rep.forks_count, forkedHis));
    setReliasedRep(profile.github_repos && profile.github_repos.filter((el) => el.owner_login === profile.github_login).reduce((acc, rep) => acc + rep.user_releases_cnt, reliasedRep));
    setReliasedRepCount(profile.github_repos && profile.github_repos.filter((el) => el.owner_login === profile.github_login).filter((el) => el.user_releases_cnt).length);
    setAllOwnRepos(profile.github_repos && profile.github_repos.filter((el) => el.owner_login === profile.github_login).length);
  }, [profile.github_repos]);

  useEffect(() => {
    if (profile.github_repos) {
      setForkedRepos(profile.github_repos && profile.github_repos.filter((el) => el.owner_login === profile.github_login).reduce((acc, rep) => acc + (rep.fork ? 1 : 0), 0));
      setCreatedRepos(profile.github_repos && profile.github_repos.filter((el) => el.owner_login === profile.github_login).length - forkedRepos);
      setReputation((allCommits * 10) + stars);
      languages();
      getTopics();
    }
    if (profile.github_orgs) {
      calcRepInORg();
    }
  }, [forkedRepos, profile.github_repos, stars]);

  const copySummary = (login:string) => {
    const summary = `[![Sourc3](https://devapp.sourc3.xyz/badges/${login}.png)](https://devapp.sourc3.xyz/profile/${login})`;
    copyToClipboard(summary);
    return message.info('Summary copied to clipboard!');
  };

  return (
    <div className={styles.wrapper}>
      {login === profile.github_profile.login && profile.github_profile.have_badge && <button type="button" className={styles.header} onClick={() => (copySummary(profile?.github_login))}>copy</button>}
      <div className={styles.summary}>
        {profile.github_repos.length > 0 && (
          <div className={styles.blockLeft}>
            <div className={styles.resumeLeft}>
              <div className={styles.resumeLeft_wrapper}>
                <span className={styles.title}>
                  {`${allOwnRepos} ${
                    allOwnRepos === 1 ? 'repository' : 'repositories'}`}
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
                    {`${forkedHis === 1 ? 'fork' : 'forks'}`}
                    {' '}
                    from their repositories
                  </span>
                </span>
              </div>

              <div className={styles.resumeLeft_wrapper}>
                <span
                  className={styles.title}
                >
                  {reliasedRep}
                  {' '}
                  <span className={styles.text}>
                    {reliasedRep === 1 ? 'release' : 'releases'}
                    {' '}
                    in
                    {' '}
                    <span className={styles.title}>{reliasedRepCount}</span>
                    <span className={styles.text}>
                      {' '}
                      {reliasedRepCount === 1 ? 'repository' : 'repositories'}
                    </span>
                  </span>
                </span>
              </div>

              {mostPopularOwnRep.length ? (
                <div className={styles.resumeLeft_wrapper}>
                  <span className={styles.text}>
                    Most popular repository:
                    {' '}
                    <span className={styles.url}>
                      <a href={`https://github.com/${mostPopularOwnRep[0].full_name}`}>{mostPopularOwnRep[0].full_name}</a>
                    </span>
                  </span>
                </div>
              ) : null}

            </div>

            <div />
            <div />
          </div>
        )}

        <div className={styles.blockRight}>
          <div className={styles.resumeLeft_wrapper}>
            <span
              className={styles.title}
            >
              {allOrgs === 1 && allOrgs === repInOrg ? `${allOrgs} repository in ` : allOrgs === repInOrg ? `${repInOrg} repositories in ` : allOrgs === 1 ? `${allOrgs} repository in ` : `${allOrgs}  repositories, ${repInOrg} in `}
              {cntOrg === 1
                ? `${cntOrg} organization`
                : `${cntOrg} organizations`}
            </span>
          </div>

          <div className={styles.resumeLeft_wrapper}>
            <span
              className={styles.title}
            >
              {relisedCount}
              {' '}
              <span className={styles.text}>
                {relisedCount === 1 ? 'release' : 'releases'}
                {' '}
                in
                {' '}
                <span className={styles.title}>
                  {relisedOrgs}
                  {' '}
                </span>
                <span className={styles.text}>
                  {relisedOrgs === 1
                    ? ' repository' : 'repositories'}
                </span>
              </span>
            </span>
          </div>
          {mostPopularOrgRep?.length ? (
            <div className={styles.resumeLeft_wrapper}>
              <span
                className={styles.text}
              >
                Most popular repository:
                {' '}
                <a href={`https://github.com/${mostPopularOrgRep[0].full_name}`}>{mostPopularOrgRep[0].full_name}</a>
              </span>
            </div>
          ) : null}
        </div>
      </div>
      {mostLanguages?.length > 0 && (
        <div className={styles.languages}>
          <span className={styles.title}>Languages:</span>
          {mostLanguages && mostLanguages.map((el) => (
            <Milestone summary title={el.language} key={`${window.crypto.randomUUID()}`} />
          ))}
        </div>
      )}
      {topics ? (
        <div className={styles.topics}>
          {topics && topics.map((el) => (
            <Milestone tags title={el} key={`${window.crypto.randomUUID()}`} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

type gitSummaryType = {
  profile: IProfiles,
};

export default GitSummary;
