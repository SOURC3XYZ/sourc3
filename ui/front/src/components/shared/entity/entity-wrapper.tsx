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
  children:JSX.Element;
  placeholder: string;
  setInputText:(str: string) => void
  showModal?: () => void;
};

function EntityWrapper({
  title, type, pkey, searchText, navItems, children, placeholder, showModal, setInputText
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
        placeholder={placeholder}
        showModal={showModal}
      />
      {children}
    </div>
  );
}

export default EntityWrapper;
