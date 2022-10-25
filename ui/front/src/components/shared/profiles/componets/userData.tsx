import { useAllRepos } from '@libs/hooks/container/all-repos';
import {
  EntityList, RepoItem, Search
} from '@components/shared';
import React, { useState } from 'react';
import { useSelector } from '@libs/redux';
import OrgListItem from '@components/shared/organizations/org-list-item';
import { ProjectListItem } from '@components/shared/entities/items';
import styles from './userData.module.scss';

const placeholder = (type:string) => `type your ${type} name, or ID`;

type userProps = {
  description: string,
};

function UserData({ description }:userProps) {
  const containerProps = useAllRepos(true);

  const {
    pkey,
    type,
    page,
    searchText,
    items,
    setInputText,
    deleteRepo
  } = containerProps;

  const { organizations, projects, repos } = useSelector((state) => state.entities);
  const myOrg = organizations.filter((el) => el.organization_creator === pkey);
  const myProjects = projects.filter((el) => el.project_creator === pkey);
  const myRepos = repos.filter((el) => el.repo_owner === pkey);

  const listItem = (item: typeof items[number]) => (
    <RepoItem
      item={item}
      path="/"
      searchText={searchText}
      deleteRepo={deleteRepo}
    />
  );
  const listItems = (item: typeof items[number]) => (
    <OrgListItem
      item={item}
      type="my"
      path="/"
      searchText={searchText}
      deleteRepo={deleteRepo}
    />
  );
  const projectList = (item: typeof items[number]) => (
    <ProjectListItem
      item={item}
      type="my"
      path="/"
      searchText={searchText}
      deleteRepo={deleteRepo}
    />
  );

  const [selectedId, setSelectedId] = useState(1);
  const toggleTabs = (idx:number) => setSelectedId(idx);

  const renderContent = (i:number) => {
    switch (i) {
      case 1:
        return (
          <div>
            <h3>Projects</h3>
            <div className={styles.search}>
              <Search placeholder={placeholder('project')} setInputText={setInputText} />
            </div>
            <EntityList
              searchText={searchText}
              renderItem={projectList}
              path="projects"
              page={page}
              items={myProjects}
              type={type}
            />
          </div>
        );
      case 2:
        return (
          <div>
            <h3>Repositories</h3>
            <div className={styles.search}>
              <Search placeholder={placeholder('repositoty')} setInputText={setInputText} />
            </div>
            <EntityList
              searchText={searchText}
              renderItem={listItem}
              path="repos"
              page={page}
              items={myRepos}
              type={type}
            />
          </div>
        );
      case 3:
        return (
          <div>
            <h3>Organizations</h3>
            <div className={styles.search}>
              <Search placeholder={placeholder('organization')} setInputText={setInputText} />
            </div>
            <EntityList
              searchText={searchText}
              renderItem={listItems}
              path="organizations"
              page={page}
              items={myOrg}
              type={type}
            />
          </div>
        );
      default:
        return (
          <div>
            <h3>Repositories</h3>
            <div className={styles.search}>
              <Search placeholder={placeholder('repositoty')} setInputText={setInputText} />
            </div>
            <EntityList
              searchText={searchText}
              renderItem={listItem}
              path="repos"
              page={page}
              items={myRepos}
              type={type}
            />
          </div>
        );
    }
  };

  return (
    <>
      <div className={styles.wrapperHeader}>
        <div className={styles.description}>
          <span>{description}</span>
        </div>
        <div className={styles.navigate}>
          <ul className={styles.menu}>
            <li className={selectedId === 1 ? styles.active : ''} onClick={() => toggleTabs(1)}>
              <span>
                Projects:
                <span className={styles.counter}>
                  {' '}
                  {myProjects.length}
                </span>
              </span>
            </li>
            <li className={selectedId === 2 ? styles.active : ''} onClick={() => toggleTabs(2)}>
              <span>
                Repositories:
                <span className={styles.counter}>

                  {' '}
                  {myRepos.length}
                </span>
              </span>
            </li>
            <li className={selectedId === 3 ? styles.active : ''} onClick={() => toggleTabs(3)}>
              <span>
                Organizations:
                <span className={styles.counter}>
                  {' '}
                  {myOrg.length}
                </span>
              </span>
            </li>
          </ul>
        </div>
      </div>
      {renderContent(selectedId)}

    </>
  );
}
export default UserData;
