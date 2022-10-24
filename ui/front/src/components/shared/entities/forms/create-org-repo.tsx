import { FormWrapper } from '@components/shared';
import { InputCustom } from '@components/shared/input';
import SelectPopup from '@components/shared/selectPopup/selectPopup';
import { useEntitiesAction } from '@libs/hooks/thunk';
import { Project } from '@types';
import { Select } from 'antd';
import { useMemo, useState } from 'react';
import styles from './form-styles.module.scss';

type InputChange = React.ChangeEventHandler<HTMLInputElement>;

type CreateOrgRepoProps = {
  projects: Project[];
  goBack: () => void;
};

function CreateOrgRepo({ projects, goBack }:CreateOrgRepoProps) {
  const [inputName, setInputName] = useState('');
  const { createRepo } = useEntitiesAction();
  const [valid, setValid] = useState(false);

  const [isPrivate, setPrivate] = useState<boolean>(false);

  const handleChange:InputChange = (e) => {
    const regExp = /(.|\s)*\S(.|\s)*/;
    setInputName(e.target.value);
    setValid(!!(regExp.test(e.target.value) && inputName));
  };

  const [idProject, setIdProject] = useState(1);

  const handleOk = () => {
    if (idProject) {
      createRepo(
        `"${inputName}"`,
        projects[idProject].project_name,
        projects[idProject].organization_name,
        +isPrivate as 0 | 1,
        0
      );
    }
  };

  const handleChangeProject = (value:any) => setIdProject(value);

  const projectOptions = useMemo(() => projects?.map(({ project_name }, i) => (
    <Select.Option
      className={styles.option}
      key={project_name}
      value={i + 1}
    >
      {project_name}
    </Select.Option>
  )), [projects]);

  const isDisabled = !idProject && !valid && !inputName;

  return (
    <FormWrapper
      title="Create Repo"
      isDisabled={isDisabled}
      goBack={goBack}
      handleOk={handleOk}
    >
      <div className={styles.wrapper}>
        <SelectPopup
          defaultValue={idProject}
          value={idProject}
          disabled={typeof idProject === null}
          onChange={handleChangeProject}
          title="Select project"
        >
          {projectOptions}
        </SelectPopup>

        <InputCustom
          label="Repository name"
          type="text"
          value={inputName}
          onChange={handleChange}
          valid={valid}
        />
        <form className={styles.type}>
          <h4>Repository type</h4>
          <ul>
            <li>
              <input
                onChange={() => setPrivate(false)}
                type="radio"
                id="f-option"
                name="selector"
                checked={!isPrivate}
              />
              <label htmlFor="f-option">Public</label>
              <div className={styles.check} />
            </li>

            <li>
              <input
                onChange={() => setPrivate(true)}
                type="radio"
                id="s-option"
                name="selector"
                checked={isPrivate}
              />
              <label htmlFor="s-option">Private</label>
              <div className={styles.check}>
                <div className="inside" />
              </div>
            </li>
          </ul>
        </form>
      </div>
    </FormWrapper>
  );
}

export default CreateOrgRepo;
