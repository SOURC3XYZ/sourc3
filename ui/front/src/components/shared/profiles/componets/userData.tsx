import { useAllRepos } from '@libs/hooks/container/all-repos';
import {
  EntityList, EntityWrapper, Nav, RepoItem, Search
} from '@components/shared';
import { useState } from 'react';
import styles from './userData.module.scss';

const placeholder = 'type your repo name or ID';

function UserData() {
  const containerProps = useAllRepos(true);

  const {
    pkey,
    type,
    path,
    page,
    searchText,
    items,
    setInputText,
    deleteRepo
  } = containerProps;
  const myItems = items.filter((el) => el.repo_owner === pkey);
  const listItem = (item: typeof items[number]) => (
    <RepoItem
      item={item}
      path={path}
      searchText={searchText}
      deleteRepo={deleteRepo}
    />
  );

  return (
    <>
      <div className={styles.navigate}>
        <ul className={styles.menu}>
          <li>
            Project
            <span>5</span>
          </li>
          <li className={styles.active}>
            Repository
            <span>5</span>
          </li>
          <li>
            Organizations
            <span>5</span>
          </li>
        </ul>
      </div>
      <div className={styles.search}>
        <Search placeholder={placeholder} setInputText={setInputText} />
      </div>
      <EntityList
        searchText={searchText}
        renderItem={listItem}
        path={path}
        page={page}
        items={myItems}
        type={type}
      />
    </>
  );
}
export default UserData;
