import { OwnerListType } from '@types';
import { useMemo } from 'react';
import {
  BeamButton, Nav, NavItem, Search
} from '@components/shared';
import styles from './entity-manager.module.scss';

type EntityManagerProps = {
  navItems?: NavItem[];
  type: OwnerListType;
  pkey: string;
  searchText: string;
  placeholder:string;
  isShowNav?: boolean;
  isAddBtnVisible: boolean;
  setInputText: (str: string) => void;
  showModal?: () => void;
};

const EntityManager = ({
  pkey,
  type,
  searchText,
  navItems,
  placeholder,
  isShowNav,
  isAddBtnVisible,
  showModal,
  setInputText
}:EntityManagerProps) => {
  const addEntityBtn = useMemo(() => (isAddBtnVisible && pkey && showModal) && (
    <div className={styles.buttonWrapper}>
      <BeamButton callback={showModal}>
        Add new
      </BeamButton>
    </div>
  ), [showModal, isAddBtnVisible, pkey]);

  const repoManager = useMemo(() => (
    <div className={styles.repoHeader}>

      {isShowNav && navItems && <Nav type={type} items={navItems} />}

      <div className={styles.manage}>
        <div className={styles.searchWrapper}>
          <Search
            text={searchText}
            placeholder={placeholder}
            setInputText={setInputText}
          />
        </div>
        {addEntityBtn}
      </div>
    </div>
  ), [searchText, pkey, type, navItems]);

  return repoManager;
};

export default EntityManager;
