import React, {useState} from 'react';
import styles from './create-project-web.module.scss';
import {InputCustom} from "@components/shared/input";
import siteIcon from '@assets/icons/site.svg';
import linkedinIcon from '@assets/icons/linkedin.svg';
import telegramIcon from '@assets/icons/telegram.svg';
import instagramIcon from '@assets/icons/instagram.svg';
import twitterSecIcon from '@assets/icons/twitterSec.svg';
import discordSecIcon from '@assets/icons/discordSec.svg';
import {NavButton} from "@components/shared";
import SelectPopup from "@components/shared/selectPopup/selectPopup";
import {Select} from "antd";
import {useSelector} from "@libs/redux";
import {itemsFilter} from "@libs/hooks/container/organization/selectors";

// type InputChange = React.ChangeEventHandler<HTMLInputElement>;

function CreateProjectWeb() {
    // const [inputName, setInputName] = useState('');
    // const [valid, setValid] = useState(true);
    const pkey = useSelector((state) => state.app.pkey);
    const organizations = useSelector((
        state
    ) => itemsFilter(state.entities.organizations, 'my', pkey));
    const [idOrg, setIdOrg] = useState(organizations[0].organization_id);
    const handleChangeOption = (value:number) => {
        setIdOrg(value);
    };
    //
    // const handleChange:InputChange = (e) => {
    //     const regExp = /[А-я]+/;
    //     setInputName(e.target.value);
    //     setValid(!regExp.test(e.target.value));
    // };
    return (
        <div className={styles.main}>
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

            />

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
                    name="Add project"
                    active
                />
            </div>
        </div>
    );
}

export default CreateProjectWeb;
