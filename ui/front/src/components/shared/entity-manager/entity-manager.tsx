import { OwnerListType } from '@types';
import { useMemo } from 'react';
import { Nav, NavItem, Search } from '@components/shared';
import styles from './entity-manager.module.scss';

type EntityManagerProps = {
  type: OwnerListType;
  pkey: string;
  searchText: string;
  navItems: NavItem[];
  setInputText: (str: string) => void;
};

const EntityManager = ({
  pkey,
  type,
  searchText,
  navItems,
  setInputText
}:EntityManagerProps) => {
  const repoManager = useMemo(() => (
    <div className={styles.repoHeader}>

      {pkey && <Nav type={type} items={navItems} />}

      <div className={styles.manage}>
        <div className={styles.searchWrapper}>
          <Search
            text={searchText}
            setInputText={setInputText}
            placeholder="Search by repo name or ID"
          />
        </div>
      </div>
    </div>
  ), [searchText, pkey]);

  return repoManager;
};

export default EntityManager;
