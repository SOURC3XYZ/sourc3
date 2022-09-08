import { Tab } from '@components/shared';
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
  pkey:string;
  children:JSX.Element;
};

function EntityWrapper({
  title,
  headerFields,
  pkey,
  children
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
      {children}
    </div>
  );
}

export default EntityWrapper;
