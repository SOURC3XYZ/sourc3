import { InputCustom } from '@components/shared/input';
import React from 'react';

type CreateOrganizationpProps = {
  name: string
};

function CreateOrganization({ name }: CreateOrganizationpProps) {
  return (
    <InputCustom
      placeholder="Enter name repository"
      value={name}
      onChange={() => {}}
    />
  );
}

export default CreateOrganization;
