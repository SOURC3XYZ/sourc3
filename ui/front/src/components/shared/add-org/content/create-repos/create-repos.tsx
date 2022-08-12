import React, { useState } from 'react';
import { Popup } from '@components/shared/popup';
import { NavButton } from '@components/shared/nav-button';
import { useSelector } from '@libs/redux/';
import { getProjectsByOrgId, itemsFilter } from '@libs/hooks/container/organization/selectors';
import { InputCustom } from '@components/shared/input';
import { useEntitiesAction } from '@libs/hooks/thunk';
import SelectPopup from '@components/shared/selectPopup/selectPopup';
import { Select } from 'antd';
import styles from './create-repos.module.scss';

type InputChange = React.ChangeEventHandler<HTMLInputElement>;

type CreateReposType = {
  handleCancel: ()=>void;
  closePopup: ()=>void;
};

function CreateRepos({ handleCancel, closePopup }: CreateReposType) {
  const [inputName, setInputName] = useState('');
  const { createRepo } = useEntitiesAction();
  const pkey = useSelector((state) => state.app.pkey);
  const pid = useSelector((state) => state.app.pid);
  const [valid, setValid] = useState(true);

  const handleChange:InputChange = (e) => {
    const regExp = /[А-я]+/;
    setInputName(e.target.value);
    setValid(!regExp.test(e.target.value));
  };

  const organizations = useSelector((
    state
  ) => itemsFilter(state.entities.organizations, 'my', pkey));

  const [idOrg, setIdOrg] = useState(organizations[0].organization_id);

  const projects = useSelector(
    (state) => getProjectsByOrgId(idOrg, state.entities.projects, 'my', pkey)
  );

  const [idProject, setIdProject] = useState('');

  const handleOk = (name:string, id:number) => {
    createRepo(`"${name}"`, id, pid);
    closePopup();
  };

  const handleChangeOption = (value:number) => {
    setIdOrg(value);
  };
  const handleChangeProject = (value:any) => {
    setIdProject(value);
  };

  return (
    <Popup
      title="Add new repository to project"
      visible
      onCancel={handleCancel}
      confirmButton={(
        <NavButton
          key="all-repos-addBtn"
          onClick={() => handleOk(inputName, +idProject)}
          isDisabled={!inputName || !idProject}
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
        <SelectPopup
          defaultValue={idProject}
          value={idProject}
          onChange={handleChangeProject}
          title="Select project"
        >
          {projects?.map(({ project_id, project_name }) => (
            <Select.Option
              className={styles.option}
              key={project_id}
              value={project_id}
            >
              {project_name}
            </Select.Option>
          ))}
        </SelectPopup>
        <InputCustom
          label="Repository name"
          type="text"
          value={inputName}
          onChange={handleChange}
          valid={valid}
        />
      </div>
    </Popup>
  );
}

export default CreateRepos;
