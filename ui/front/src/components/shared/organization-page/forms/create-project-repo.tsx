import { FormWrapper } from '@components/shared';
import { InputCustom } from '@components/shared/input';
import { useEntitiesAction } from '@libs/hooks/thunk';
import { useState } from 'react';
import styles from './form-styles.module.scss';

type InputChange = React.ChangeEventHandler<HTMLInputElement>;

type CreateOrgRepoProps = {
  idProject: number;
  goBack: () => void;
};

function CreateProjectRepo({ idProject, goBack }:CreateOrgRepoProps) {
  const [inputName, setInputName] = useState('');
  const { createRepo } = useEntitiesAction();
  const [valid, setValid] = useState(false);

  const [isPrivate, setPrivate] = useState<boolean>(false);

  const handleChange:InputChange = (e) => {
    const regExp = /(.|\s)*\S(.|\s)*/;
    setInputName(e.target.value);
    setValid(!!(regExp.test(e.target.value) && inputName));
  };

  const handleOk = () => {
    createRepo(`"${inputName}"`, idProject, +isPrivate as 0 | 1, 0);
  };

  const isDisabled = !valid && !inputName;

  return (
    <FormWrapper
      title="Create Repo"
      isDisabled={isDisabled}
      goBack={goBack}
      handleOk={handleOk}
    >
      <div className={styles.wrapper}>
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

export default CreateProjectRepo;
