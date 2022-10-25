import React from 'react';
import { useOrganizationsList } from '@libs/hooks/container/organization';
import { CreateModal } from '@components/shared';

type CRORG = {
  handleCancel: ()=>void;
  closePopup: ()=>void;
};

function CreateOrg({ handleCancel, closePopup }: CRORG) {
  const { modalApi } = useOrganizationsList();
  const {
    handleOk
  } = modalApi;

  return (
    <CreateModal
      title="Add organization"
      label="Organizations name"
      isModalVisible
      placeholder="Enter your organization name"
      handleCreate={handleOk}
      handleCancel={handleCancel}
      closePopup={closePopup}
    />
  );
}

export default CreateOrg;
