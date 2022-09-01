import { OwnerListType } from '@types';
import { useMemo } from 'react';
import {
  BeamButton, Nav, NavItem, Search
} from '@components/shared';
import styles from './entity-manager.module.scss';

type EntityManagerProps = {
  type: OwnerListType;
  pkey: string;
  searchText: string;
  navItems: NavItem[];
  placeholder:string;
  setInputText: (str: string) => void;
  showModal?: () => void;
};

const EntityManager = ({
  pkey,
  type,
  searchText,
  navItems,
  placeholder,
  showModal,
  setInputText
}:EntityManagerProps) => {
  const addEntityBtn = useMemo(() => (pkey && showModal) && (
    <div className={styles.buttonWrapper}>
      <BeamButton callback={showModal}>
        Add new
      </BeamButton>
    </div>
  ), [showModal, pkey]);

  const repoManager = useMemo(() => (
    <div className={styles.repoHeader}>

      {pkey && <Nav type={type} items={navItems} />}

      <div className={styles.manage}>
        <div className={styles.searchWrapper}>
          <Search
            text={searchText}
            setInputText={setInputText}
            placeholder={placeholder}
          />
        </div>
        {addEntityBtn}
      </div>
    </div>
  ), [searchText, pkey, type, navItems]);

  return repoManager;
};

export default EntityManager;
