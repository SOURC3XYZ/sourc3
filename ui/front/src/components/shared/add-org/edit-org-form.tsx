/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import {
  DiscordIcon, InstagrammIcon, LinkedinIcon, SiteIcon, TelegramIcon, TwitterIcon, Uploader
} from '@components/shared';
import TextArea from 'antd/lib/input/TextArea';
import styles from './edit-form.module.scss';
import { InputCustom } from '../input';
import { FormFields, useEditOrgForm } from './hooks';
import FormWrapper from './form-wrapper';

interface EditOrgProps extends FormFields {
  labels: {
    title: string;
    nameLabel: string,
    namePlaceholder: string,
    shortDescPlaceholder?: string,
    longDescPlaceholder?:string
  };
  pkey: string;
  isDescription:boolean;
  callback: (state: any) => void;
  goBack: () => void;
}
function EditOrg({
  pkey, labels, goBack, isDescription, callback, ...props
}: EditOrgProps) {
  const {
    title,
    nameLabel,
    namePlaceholder,
    shortDescPlaceholder = '',
    longDescPlaceholder = ''
  } = labels;
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
    <FormWrapper
      title={title}
      isDisabled={!!notValidItems.size}
      goBack={goBack}
      handleOk={handleOk}
    >
      <>
        <div className={styles.name}>
          <InputCustom
            id="org-name"
            label={nameLabel}
            type="text"
            placeholder={namePlaceholder}
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
            placeholder={shortDescPlaceholder}
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
              placeholder={longDescPlaceholder}
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
      </>
    </FormWrapper>
  );
}

export default EditOrg;
