import { Tab } from '@components/shared';
import { useMemo } from 'react';
import styles from './entity-wrapper.module.scss';
import EntityHeader, { AvatarParams, SocialLinks } from './entity-header';

export type HeaderFields = {
  pkey: string,
  owner: string,
  shortTitle:string,
  yourPermissions: boolean[] | null
  tabData: Tab[],
  routes: string[],
  avatar: AvatarParams,
  description?: string,
  socialLinks: SocialLinks,
};

type EntityWrapperProps = {
  headerFields?: HeaderFields
  title: string;
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
      yourPermissions={headerFields.yourPermissions}
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
