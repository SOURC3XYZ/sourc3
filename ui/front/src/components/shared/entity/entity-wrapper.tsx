import {
  EntityManager, NavItem, Tab
} from '@components/shared';
import { OwnerListType } from '@types';
import { useMemo } from 'react';
import styles from './entity-wrapper.module.scss';
import EntityHeader, { SocialLinks } from './entity-header';

type HeaderFields = {
  pkey: string,
  owner: string,
  shortTitle?:string,
  tabData: Tab[],
  routes: string[],
  avatar: string,
  description: string,
  socialLinks: SocialLinks
};

type EntityWrapperProps = {
  title: string;
  headerFields?: HeaderFields
  type: OwnerListType;
  pkey:string;
  searchText: string;
  navItems: NavItem[];
  children:JSX.Element;
  placeholder: string;
  setInputText:(str: string) => void
  showModal?: () => void;
};

function EntityWrapper({
  title,
  headerFields,
  type,
  pkey,
  searchText,
  navItems,
  children,
  placeholder,
  showModal,
  setInputText
}:EntityWrapperProps) {
  const header = useMemo(() => !!headerFields && (
    <EntityHeader
      pkey={pkey}
      owner={headerFields.owner}
      shortTitle={headerFields.shortTitle}
      routes={headerFields.routes}
      tabData={headerFields.tabData}
      avatar={headerFields.avatar}
      description={headerFields.description}
      socialLinks={headerFields.socialLinks}
      title={title}
    />
  ), [headerFields, title]);
  return (
    <div className={styles.content}>
      {header}
      <EntityManager
        type={type}
        pkey={pkey}
        searchText={searchText}
        navItems={navItems}
        setInputText={setInputText}
        placeholder={placeholder}
        showModal={showModal}
      />
      {children}
    </div>
  );
}

export default EntityWrapper;
