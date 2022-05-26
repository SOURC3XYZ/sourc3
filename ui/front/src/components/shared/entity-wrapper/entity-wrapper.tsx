import Title from 'antd/lib/typography/Title';
import { EntityManager, NavItem } from '@components/shared';
import { OwnerListType } from '@types';
import styles from './entity-wrapper.module.scss';

type EntityWrapperProps = {

  title: string;
  type: OwnerListType;
  pkey:string;
  searchText: string;
  navItems: NavItem[];
  children:JSX.Element
  setInputText:(str: string) => void

};

function EntityWrapper({
  title, type, pkey, searchText, navItems, children, setInputText
}:EntityWrapperProps) {
  return (
    <div className={styles.content}>
      <Title level={3}>{title}</Title>
      <EntityManager
        type={type}
        pkey={pkey}
        searchText={searchText}
        navItems={navItems}
        setInputText={setInputText}
      />
      {children}
    </div>
  );
}

export default EntityWrapper;
