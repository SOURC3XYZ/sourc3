/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import {
  DiscordIcon, InstagrammIcon, LinkedinIcon, SiteIcon, TelegramIcon, TwitterIcon, Uploader
} from '@components/shared';
import TextArea from 'antd/lib/input/TextArea';
import styles from './edit-form.module.scss';
import { InputCustom } from '../input';
import { NavButton } from '../nav-button';
import { FormFields, useEditOrgForm } from './hooks';

interface EditOrgProps extends FormFields {
  pkey: string;
  title: string;
  isDescription:boolean;
  callback: (state: any) => void;
  goBack: () => void;
}
function EditOrg({
  pkey, title, goBack, isDescription, callback, ...props
}: EditOrgProps) {
  const {
    name,
    about,
    imgParams,
    website,
    short_title: shortTitle,
    linkedin,
    telegram,
    instagram,
    twitter,
    discord,
    notValidItems,
    handleOk,
    validate,
    handleChange,
    getImgHandler,
    handleTextareaChange
  } = useEditOrgForm(props, callback);

  const avatar = imgParams && <img src={imgParams.link} alt="avatar" />;

  return (
    <div className={styles.main}>
      <h4>{title}</h4>
      <div className={styles.name}>
        <InputCustom
          id="org-name"
          label="Organization name"
          type="text"
          placeholder="Test organization"
          value={name}
          onChange={handleChange}
          valid={!!name.length}
        />
      </div>
      <div className={styles.description}>
        <h4>Short description</h4>
        <InputCustom
          id="org-short_title"
          type="text"
          placeholder="Organization short description"
          value={shortTitle}
          onChange={handleChange}
        />
        <p>100 characters max</p>
      </div>

      <div className={styles.upload}>
        <Uploader returnImg={getImgHandler} />
        <p>300x300 px (jpg, png, gif)</p>
        {avatar}
      </div>

      {'about' in props && (
        <div className={styles.description}>
          <h4>Full description</h4>
          <TextArea
            id="org-about"
            value={about}
            placeholder="Organization description"
            onChange={handleTextareaChange}
            maxLength={1024}
            autoSize={{ minRows: 3, maxRows: 5 }}
          />
        </div>
      )}

      <div className={styles.social}>
        <h4>Social networks</h4>
        <div className={styles.inputs}>
          <div className={styles.input}>
            <SiteIcon className={styles.icon} />
            <InputCustom
              id="org-website"
              type="text"
              onChange={handleChange}
              value={website}
              placeholder="https://website.name/"
              valid={validate(website, 'website')}
            />
          </div>
          <div className={styles.input}>
            <LinkedinIcon className={styles.icon} />
            <InputCustom
              id="org-linkedin"
              onChange={handleChange}
              value={linkedin}
              placeholder="(in|pub)/nickname"
              valid={validate(linkedin, 'linkedin')}
            />
          </div>
          <div className={styles.input}>
            <TelegramIcon className={styles.icon} />
            <InputCustom
              id="org-telegram"
              onChange={handleChange}
              value={telegram}
              placeholder="@nickname"
              valid={validate(telegram, 'telegram')}

            />
          </div>
          <div className={styles.input}>
            <InstagrammIcon className={styles.icon} />
            <InputCustom
              id="org-instagram"
              type="text"
              onChange={handleChange}
              value={instagram}
              placeholder="nickname"
              valid={validate(instagram, 'instagram')}
            />
          </div>
          <div className={styles.input}>
            <TwitterIcon className={styles.icon} />
            <InputCustom
              id="org-twitter"
              type="text"
              onChange={handleChange}
              value={twitter}
              placeholder="nickname"
              valid={validate(twitter, 'twitter')}
            />
          </div>
          <div className={styles.input}>
            <DiscordIcon className={styles.icon} />
            <InputCustom
              id="org-discord"
              type="text"
              onChange={handleChange}
              value={discord}
              placeholder="login#0000"
              valid={validate(discord, 'discord')}
            />
          </div>
        </div>
      </div>
      <div className={styles.buttons}>
        <NavButton
          onClick={goBack}
          name="Cancel"
        />
        <NavButton
          onClick={handleOk}
          name="Add"
          isDisabled={!!notValidItems.size}
        />
      </div>
    </div>
  );
}

export default EditOrg;
