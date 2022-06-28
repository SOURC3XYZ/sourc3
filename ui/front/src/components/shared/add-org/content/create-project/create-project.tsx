import React, { useState } from 'react';
import { Popup } from '@components/shared/popup';
import { NavButton } from '@components/shared/nav-button';
import { useSelector } from '@libs/redux';
import { itemsFilter } from '@libs/hooks/container/organization/selectors';
import { InputCustom } from '@components/shared/input';
import { useEntitiesAction } from '@libs/hooks/thunk';
import SelectPopup from '@components/shared/selectPopup/selectPopup';
import { Select } from 'antd';
import styles from './create-project.module.scss';

type CreateProjectType = {
  handleCancel: ()=>void;
  closePopup: ()=>void;
};
// type OrganizationType = {
//   organization_creator: string
//   organization_id: number
//   organization_name: string
//   organization_tag: number
// };

function CreateProject({ handleCancel, closePopup }: CreateProjectType) {
  const [inputName, setInputName] = useState('');
  const { createProject } = useEntitiesAction();
  const pkey = useSelector((state) => state.app.pkey);
  const pid = useSelector((state) => state.app.pid);

  const handleChange = (e:any) => setInputName(e.target?.value);

  const organizations = useSelector((
    state
  ) => itemsFilter(state.entities.organizations, 'my', pkey));
  const [idOrg, setIdOrg] = useState(organizations[0].organization_id);

  const handleOk = (name:string, id:number) => {
    createProject(name, id, pid);
    closePopup();
  };

  const handleChangeOption = (value:number) => {
    setIdOrg(value);
  };

  return (
    <Popup
      title="Add new project to organization"
      visible
      onCancel={handleCancel}
      confirmButton={(
        <NavButton
          key="all-repos-addBtn"
          onClick={() => handleOk(inputName, idOrg)}
          isDisabled={!inputName}
          name="Add"
          active
        />
      )}
      agree
    >
      <div className={styles.wrapper}>
        <SelectPopup
          onChange={handleChangeOption}
          defaultValue={idOrg}
          value={idOrg}
          title="Select organization"
        >
          {organizations?.map(({ organization_id, organization_name }) => (
            <Select.Option
              className={styles.option}
              key={organization_id}
              value={organization_id}
            >
              {organization_name}
            </Select.Option>
          ))}
        </SelectPopup>
        <InputCustom
          label="Project name"
          type="text"
          value={inputName}
          onChange={handleChange}
        />
      </div>
    </Popup>
  );
}

export default CreateProject;
