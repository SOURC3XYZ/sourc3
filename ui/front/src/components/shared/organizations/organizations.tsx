import {
  BeamButton, CreateModal, Nav, Search
} from '@components/shared';
import { useMemo } from 'react';
import { Typography } from 'antd';
import { useOrganization } from '@libs/hooks/container/organization';
import styles from './organizations.module.scss';
import { OrgList } from './list';

const { Title } = Typography;

const placeholder = 'Enter your organization name';

function Organizations() {
  const {
    items,
    searchText,
    type,
    page,
    path,
    pkey,
    isModal,
    showModal,
    closeModal,
    setInputText,
    handleOk
  } = useOrganization();

  const navItems = [
    {
      key: 'all',
      to: `${path}organizations/all/1`,
      text: 'All Organizations'
    },
    {
      key: 'my',
      to: `${path}organizations/my/1`,
      text: 'My Organizations'
    }
  ];

  const repoManager = useMemo(() => (
    <div className={styles.repoHeader}>
      {pkey && <Nav type={type} items={navItems} />}

      <div className={styles.manage}>
        <div className={styles.searchWrapper}>
          <Search
            text={searchText}
            setInputText={setInputText}
            placeholder="Search by organization name or ID"
          />
        </div>
        {pkey && (
          <div className={styles.buttonWrapper}>
            <BeamButton callback={showModal}>
              Add new
            </BeamButton>
          </div>
        )}
      </div>

      <CreateModal
        isModalVisible={isModal}
        placeholder={placeholder}
        handleCreate={handleOk}
        handleCancel={closeModal}
      />
    </div>
  ), [searchText, pkey, isModal]);

  return (
    <div className={styles.content}>
      <Title level={3}>Organizations</Title>
      {repoManager}
      <OrgList
        items={items}
        searchText={searchText}
        path={path}
        type={type}
        page={page}
      />
    </div>
  );
}

export default Organizations;
