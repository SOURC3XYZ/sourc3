import React, {useState} from 'react';
import {Popup} from '@components/shared/popup';
import {NavButton} from '@components/shared/nav-button';
import {useSelector} from '@libs/redux';
import {itemsFilter} from '@libs/hooks/container/organization/selectors';
import {InputCustom} from '@components/shared/input';
import {useEntitiesAction} from '@libs/hooks/thunk';
import SelectPopup from '@components/shared/selectPopup/selectPopup';
import {Select} from 'antd';
import siteIcon from '@assets/icons/site.svg';
import linkedinIcon from '@assets/icons/linkedin.svg';
import telegramIcon from '@assets/icons/telegram.svg';
import instagramIcon from '@assets/icons/instagram.svg';
import twitterSecIcon from '@assets/icons/twitterSec.svg';
import discordSecIcon from '@assets/icons/discordSec.svg';
import styles from './create-project.module.scss';

type InputChange = React.ChangeEventHandler<HTMLInputElement>;
type CreateProjectType = {
    handleCancel: () => void;
    closePopup: () => void;
};
// type OrganizationType = {
//   organization_creator: string
//   organization_id: number
//   organization_name: string
//   organization_tag: number
// };

function CreateProject({handleCancel, closePopup}: CreateProjectType) {
    const [inputName, setInputName] = useState('');
    const {createProject} = useEntitiesAction();
    const pkey = useSelector((state) => state.app.pkey);
    const pid = useSelector((state) => state.app.pid);

    const [valid, setValid] = useState(true);

    const handleChange: InputChange = (e) => {
        const regExp = /[А-я]+/;
        setInputName(e.target.value);
        setValid(!regExp.test(e.target.value));
    };

    const organizations = useSelector((
        state
    ) => itemsFilter(state.entities.organizations, 'my', pkey));
    const [idOrg, setIdOrg] = useState(organizations[0].organization_id);

    const handleOk = (name: string, id: number) => {
        createProject(`"${name}"`, id, pid);
        closePopup();
    };

    const handleChangeOption = (value: number) => {
        setIdOrg(value);
    };

    const handleCanceled = () => {
        handleCancel();
        setInputName('');
    };

    return (
        <Popup
            title="Add new project"
            visible
            onCancel={handleCanceled}
            // confirmButton={(
            //   <NavButton
            //     key="all-repos-addBtn"
            //     onClick={() => handleOk(inputName, idOrg)}
            //     isDisabled={!inputName || !valid}
            //     name="Add"
            //     active
            //   />
            // )}
            agree
        >
            <div className={styles.main}>
                <div className={styles.name}>
                    <InputCustom
                        label="Project name"
                        type="text"
                        placeholder={'Test organization'}
                        value={inputName}
                        onChange={handleChange}
                        valid={valid}
                    />
                </div>
                <SelectPopup
                    onChange={handleChangeOption}
                    defaultValue={idOrg}
                    value={idOrg}
                    title="Select organization"
                >
                    {organizations?.map(({organization_id, organization_name}) => (
                        <Select.Option
                            className={styles.option}
                            key={organization_id}
                            value={organization_id}
                        >
                            {organization_name}
                        </Select.Option>
                    ))}
                </SelectPopup>

                <div className={styles.description}>
                    <h4>Short description</h4>
                    <InputCustom
                        type="text"
                        placeholder={"Test organization short description"}
                    />
                    <p>100 characters max</p>
                </div>

                <div className={styles.upload}>
                    <input type="file" id="upload" hidden/>
                    <label htmlFor="upload">Upload logo</label>
                    <p>300x300 px (jpg, png, gif)</p>
                </div>

                <div className={styles.social}>
                    <h4>Social networks</h4>
                    <div className={styles.inputs}>
                        <div className={styles.input}>
                            <img src={siteIcon}/>
                            <InputCustom
                                type="text"
                                placeholder={"https://website.name/"}
                            />
                        </div>
                        <div className={styles.input}>
                            <img src={linkedinIcon}/>
                            <InputCustom
                                type="text"
                                placeholder={"@nickname"}
                            />
                        </div>
                        <div className={styles.input}>
                            <img src={telegramIcon}/>
                            <InputCustom
                                type="text"
                                placeholder={"@nickname"}
                            />
                        </div>
                        <div className={styles.input}>
                            <img src={instagramIcon}/>
                            <InputCustom
                                type="text"
                                placeholder={"@nickname"}
                            />
                        </div>
                        <div className={styles.input}>
                            <img src={twitterSecIcon}/>
                            <InputCustom
                                type="text"
                                placeholder={"@nickname"}
                            />
                        </div>
                        <div className={styles.input}>
                            <img src={discordSecIcon}/>
                            <InputCustom
                                type="text"
                                placeholder={"login#0000"}
                            />
                        </div>
                    </div>
                </div>
                <div className={styles.buttons}>
                    <NavButton
                        name="Cancel"
                        isDisabled={true}
                    />
                    <NavButton
                        key="all-repos-addBtn"
                        onClick={() => handleOk(inputName, idOrg)}
                        isDisabled={!inputName || !valid}
                        name="Add"
                        active
                    />
                </div>
            </div>
        </Popup>
    );
}

export default CreateProject;
