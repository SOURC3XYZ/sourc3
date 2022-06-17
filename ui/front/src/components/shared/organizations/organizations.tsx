import {
  CreateModal,
  EntityList,
  EntityWrapper
} from '@components/shared';
import { useOrganization } from '@libs/hooks/container/organization';
import OrgListItem from './org-list-item';

const placeholder = 'Search by organization name or ID';

function Organizations() {
  const {
    items,
    searchText,
    type,
    page,
    path,
    pkey,
    modalApi
  } = useOrganization();

  const {
    isModal,
    showModal,
    closeModal,
    setInputText,
    handleOk
  } = modalApi;

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

  const listItems = (item: typeof items[number]) => (
    <OrgListItem
      item={item}
      path={path}
      searchText={searchText}
      type={type}

    />
  );

  return (
    <EntityWrapper
      title="Organizations"
      type={type}
      pkey={pkey}
      searchText={searchText}
      navItems={navItems}
      setInputText={setInputText}
      placeholder={placeholder}
      showModal={showModal}
    >
      <>
        <CreateModal
          isModalVisible={isModal}
          placeholder="Enter your organization name"
          handleCreate={handleOk}
          handleCancel={closeModal}
        />
        <EntityList
          searchText={searchText}
          renderItem={listItems}
          route="organizations"
          path={path}
          page={page}
          items={items}
          type={type}
        />
      </>
    </EntityWrapper>
  );
}

export default Organizations;
