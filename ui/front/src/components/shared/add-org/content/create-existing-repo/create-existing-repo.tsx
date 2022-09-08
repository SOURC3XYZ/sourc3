import React, { useState } from 'react';
import { Popup } from '@components/shared/popup';
import { NavButton } from '@components/shared/nav-button';
import { useSelector } from '@libs/redux/';
import { getProjectsByOrgId, itemsFilter } from '@libs/hooks/container/organization/selectors';
import { useEntitiesAction } from '@libs/hooks/thunk';
import styles from './create-existing-repo.module.scss';

type InputChange = React.ChangeEventHandler<HTMLInputElement>;

type CreateReposType = {
  handleCancel: ()=>void;
  closePopup: ()=>void;
};

function CreateExisting({ handleCancel, closePopup }: CreateReposType) {
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

  return (
    <Popup
      title="Add existing repository"
      visible
      onCancel={handleCancel}
      confirmButton={(
        <NavButton
          key="all-repos-addBtn"
          onClick={() => handleOk(inputName, +idProject)}
          isDisabled={!inputName || !idProject ! || !valid}
          name="Add"
          classes={styles.button}
          active
        />
      )}
      agree
    >
      <div className={styles.wrapper}>
        <div className={styles.titleHead}>
          <h4>You can import all the files, including the revision history, from another version control system</h4>
        </div>
        <div className={styles.footer}>
        <div className={styles.type}>
          <h4>Repository type</h4>
          <ul>
            <li>
              <input type="radio" id="f-option" name="selector" checked/>
                <label htmlFor="f-option">Public</label>

                <div className={styles.check}></div>
            </li>

            <li>
              <input type="radio" id="s-option" name="selector" />
                <label htmlFor="s-option">Private</label>

                <div className={styles.check}>
                  <div className="inside"></div>
                </div>
            </li>
          </ul>
        </div>
          <div className={styles.upload}>
            <input type="file" id="upload" hidden />
            <label htmlFor="upload">Add a file here</label>
          </div>
        </div>
      </div>
    </Popup>
  );
}

export default CreateExisting;
