/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import {
  DiscordIcon, InstagrammIcon, LinkedinIcon, SiteIcon, TelegramIcon, TwitterIcon, Uploader
} from '@components/shared';
import TextArea from 'antd/lib/input/TextArea';
import { useObjectState, useUpload } from '@libs/hooks/shared';
import { Entries, Organization } from '@types';
import {
  useCallback, useEffect, useState
} from 'react';
import { useEntitiesAction } from '@libs/hooks/thunk';
import { Link } from 'react-router-dom';
import styles from './edit-form.module.scss';
import { InputCustom } from '../input';
import { NavButton } from '../nav-button';

type InputChange<T> = React.ChangeEventHandler<T>;

interface EditOrgProps extends Organization {
  pkey: string
}

const regExes = {
  name: /(.|\s)*\S(.|\s)*/,
  website: /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/,
  telegram: /.*\B@(?=\w{5,32}\b)[a-zA-Z0-9]+(?:_[a-zA-Z0-9]+)*.*/,
  discord: /^.{3,32}#[0-9]{4}$/,
  linkedin: /(in|pub)\/[A-z0-9_-]+\/?/,
  instagram: /^[a-zA-Z0-9._]+$/,
  twitter: /^[a-zA-Z0-9_]{1,15}$/
};

function EditOrg({ pkey, ...props }: EditOrgProps) {
  const [state, setState] = useObjectState({
    organization_id: props.organization_id,
    name: props.organization_name,
    short_title: props.organization_short_title,
    about: props.organization_about,
    telegram: props.organization_telegram,
    discord: props.organization_discord,
    website: props.organization_website,
    instagram: props.organization_instagram,
    logo_addr: props.organization_logo_ipfs_hash,
    twitter: props.organization_twitter,
    linkedin: props.organization_twitter
  });
  const [imgParams, setImgParams] = useState<{ link: string, blob?: Blob } | null>(null);

  const { uploadToIpfs, getImgUrlFromIpfs } = useUpload();

  const {
    name, logo_addr: ipfsHash, short_title: shortTitle, about, telegram, discord, website, instagram, linkedin, twitter
  } = state;

  const [notValidItems, setNotValidItems] = useState<Set<keyof typeof regExes>>(new Set());

  const addKey = (key:keyof typeof regExes) => setNotValidItems((prev) => new Set(prev.add(key)));

  const removeKey = (key:keyof typeof regExes) => setNotValidItems(
    (prev) => new Set([...prev].filter((x) => x !== key))
  );

  const { setModifyOrg } = useEntitiesAction();

  const validate = (str:string, key:keyof typeof regExes) => {
    if (!str.length) return true;
    return !!str.match(regExes[key]);
  };

  const getSrc = async () => {
    if (ipfsHash) {
      const link = await getImgUrlFromIpfs(ipfsHash);
      if (link) setImgParams({ link });
    }
  };

  useEffect(() => {
    getSrc();
    const entries = Object.entries(state) as Entries<typeof state>;
    const notMatchArray:(keyof typeof regExes)[] = [];
    entries.forEach((el) => {
      const [key, value] = el as [keyof typeof regExes, string];
      const regex = regExes[key];
      if (regex && value.length && !value.match(regex)) notMatchArray.push(key);
    });
    setNotValidItems(new Set(notMatchArray));
  }, []);

  const generic = useCallback(<T extends Event>(e: T) => {
    const { id, value } = e.target as HTMLInputElement;
    const key = id.replace('org-', '') as keyof typeof regExes;

    if (regExes[key]) {
      const isValid = validate(value, key);
      if (!isValid) addKey(key);
      else removeKey(key);
    }

    setState({ [key]: `${value}` });
  }, [state]);

  const handleChange = generic as InputChange<HTMLInputElement>;
  const handleTextareaChange = generic as InputChange<HTMLTextAreaElement>;

  const handleOk = async () => {
    const toSend = { ...state };
    const entries = Object.entries(state) as Entries<typeof state>;
    entries.forEach((el) => {
      const [key, value] = el as [keyof typeof state, never];
      if (typeof value === 'string' && (value as string).length) {
        toSend[key] = `"${value}"` as never;
        return;
      }
      toSend[key] = value;
    });

    if (imgParams?.blob) {
      const { hash } = await uploadToIpfs(imgParams.blob);
      if (hash) toSend.logo_addr = hash;
    }
    setModifyOrg(toSend);
  };

  const getImgHandler = useCallback((link:string, blob: Blob) => {
    setImgParams({ link, blob });
  }, [imgParams]);

  const avatar = imgParams && <img src={imgParams.link} alt="avatar" />;

  return (
    <div className={styles.main}>
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
        <Link to="projects">
          <NavButton
            name="Cancel"
          />
        </Link>
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
