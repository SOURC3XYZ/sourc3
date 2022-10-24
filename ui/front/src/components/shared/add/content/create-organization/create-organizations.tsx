import { InputCustom } from '@components/shared/input';
import React from 'react';

type CreateOrganization = {
  name: string
};

function CreateOrganization({ name }: CreateOrganization) {
  return (
    <InputCustom
      placeholder="Enter name repository"
      value={name}
      onChange={onChange}
    />
  );
}

export default CreateOrganization;
