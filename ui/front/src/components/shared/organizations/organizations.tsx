import {
  CreateModal,
  EntityList,
  EntityWrapper
} from '@components/shared';
import { useOrganizationsList } from '@libs/hooks/container/organization';
import OrgListItem from './org-list-item';

function Organizations() {
  const {
    items,
    searchText,
    type,
    page,
    path,
    pkey,
    modalApi
  } = useOrganizationsList();

  const {
    isModal,
    closeModal,
    handleOk
  } = modalApi;

  // const navItems = [
  //   {
  //     key: 'all',
  //     to: `${path}organizations/all/1`,
  //     text: 'All Organizations'
  //   },
  //   {
  //     key: 'my',
  //     to: `${path}organizations/my/1`,
  //     text: 'My Organizations'
  //   }
  // ];

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
      pkey={pkey}
    >
      <>
        <CreateModal
          title="Add organization"
          label="Organizations name"
          isModalVisible={isModal}
          placeholder="Enter your organization name"
          handleCreate={handleOk}
          handleCancel={closeModal}
        />
        <EntityList
          searchText={searchText}
          renderItem={listItems}
          page={page}
          items={items}
        />
      </>
    </EntityWrapper>
  );
}

export default Organizations;
