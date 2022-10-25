import { InputCustom } from '@components/shared/input';
import { NavButton } from '@components/shared/nav-button';
import { Popup } from '@components/shared/popup';
import { useSelector } from '@libs/redux';
import {
  getProjectsByOrgId, getReposByProject, itemsFilter
} from '@libs/hooks/container/organization/selectors';
import { useEntitiesAction } from '@libs/hooks/thunk';
import {
} from 'antd';
import { useState } from 'react';
import styles from './create-modal.module.scss';

type CreateModalProps = {
  handleOk: () => void;
  handleCancel: () => void;
  // createRepo: (name: string, projectId?: number, pid?: number | undefined) => void
};

function CreateModal({
  handleOk,
  handleCancel
  // createRepo
}: CreateModalProps) {
  const [name, setName] = useState('');
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };
  const { createRepo } = useEntitiesAction();

  const onCancel = () => {
    // createRepo(name, 0);
    handleCancel();
  };
  const pkey = useSelector((state) => state.app.pkey);
  const pid = useSelector((state) => state.app.pid);

  const items = useSelector((state) => itemsFilter(state.entities.organizations, 'my', pkey));
  const repos = useSelector(
    (state) => getReposByProject(6, state.entities.repos, 'my', pkey)
  );
  const projects = useSelector(
    (state) => getProjectsByOrgId(5, state.entities.projects, 'my', pkey)
  );

  const onSubmit = (nameRep: string) => {
    createRepo(nameRep, pid);
    handleOk();
  };
  return (
    <Popup
      title="Add new repository"
      visible
      onCancel={onCancel}
      confirmButton={(
        <NavButton
          key="all-repos-addBtn"
          onClick={() => onSubmit(name)}
          isDisabled={!name}
          name="Add"
          active
        />
      )}
      agree
    >
      <div className={styles.wrapper}>
        {/* <SelectPopup
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
       </SelectPopup> */}
        <InputCustom
          label="Repository name"
          type="text"
          value={name}
          onChange={onChange}
          placeholder="Enter name repository"
        />
      </div>
    </Popup>
  );
}

export default CreateModal;
