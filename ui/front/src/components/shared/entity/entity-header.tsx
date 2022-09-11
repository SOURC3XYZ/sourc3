import { useUpload } from '@libs/hooks/shared';
import { Entries } from '@types';
import {
  useCallback, useEffect, useMemo, useState
} from 'react';
import {
  DiscordIcon,
  InstagrammIcon,
  LinkedinIcon,
  SettingsIcon,
  SiteIcon,
  Tab,
  Tabs,
  TelegramIcon,
  TwitterIcon
} from '@components/shared';
import classNames from 'classnames';
import Title from 'antd/lib/typography/Title';
import Text from 'antd/lib/typography/Text';
import { Link, useNavigate } from 'react-router-dom';
import styles from './entity-wrapper.module.scss';

export type SocialLinks = {
  website: string
  twitter: string,
  instagram: string,
  telegram: string,
  linkedin: string,
  discord: string
};

type EntityHeaderProps = {
  pkey: string,
  owner:string,
  shortTitle?:string,
  routes:string[],
  tabData: Tab[]
  avatar: string,
  description: string,
  socialLinks: SocialLinks,
  title: string
};

type SocialLinkMapObject = {
  Component: React.FC,
  link: string
};

const socialLinksData = new Map<keyof SocialLinks, SocialLinkMapObject>()
  .set('website', {
    Component: () => (<SiteIcon className={styles.icon} />),
    link: ' https://'
  })
  .set('discord', {
    Component: () => (<DiscordIcon className={styles.icon} />),
    link: ' https://www.discord.com/invite/'
  })
  .set('telegram', {
    Component: () => <TelegramIcon className={styles.icon} />,
    link: 'https://telegram.me/'
  })
  .set('twitter', {
    Component: () => <TwitterIcon className={styles.icon} />,
    link: 'https://twitter.com/'
  })
  .set('instagram', {
    Component: () => <InstagrammIcon className={styles.icon} />,
    link: 'https://www.instagram.com/'
  })
  .set('linkedin', {
    Component: () => <LinkedinIcon className={styles.icon} />,
    link: 'https://www.linkedin.com/'
  });

function SocialLinkHOC({ key, value }: {
  key: keyof SocialLinks,
  value: string
}) {
  const data = socialLinksData.get(key);
  if (!data || !value) return null;

  const { Component, link } = data;
  return (
    <a
      className={styles.icon}
      key={key}
      href={`${link}${value}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <Component />
    </a>
  );
}

function EntityHeader({
  pkey, owner, shortTitle, routes, tabData, avatar, description, socialLinks, title
}:EntityHeaderProps) {
  const { getImgUrlFromIpfs } = useUpload();

  const [showMore, setShowMore] = useState(false);
  const [src, setSrc] = useState<string | undefined>(undefined);
  const [currentTab, setCurrentTab] = useState(0);

  const navigate = useNavigate();

  const handleLoadPic = useCallback(async () => {
    if (avatar) {
      const link = await getImgUrlFromIpfs(avatar);
      if (link) setSrc(link);
    }
  }, []);

  useEffect(() => {
    handleLoadPic();
  }, []);

  const showMoreBtn = useMemo(() => {
    const text = showMore ? 'Show less' : 'Show more';
    const onChangeHandler = () => setShowMore((prev) => !prev);
    return (
      <button className={styles.showMoreBtn} type="button" onClick={onChangeHandler}>
        {text}
      </button>
    );
  }, [showMore]);

  const descriptionClass = showMore ? styles.descriptionActive : styles.description;

  const socialLinksView = useMemo(() => {
    const entries = Object.entries(socialLinks) as Entries<SocialLinks>;
    const links = entries.map((el) => {
      const [key, value] = el;
      return SocialLinkHOC({ key, value });
    })
      .filter((el) => el);
    return links;
  }, []);

  const settings = useMemo(() => (
    pkey === owner && (
      <Link className={styles.settingLink} to="edit">
        <SettingsIcon className={styles.icon} />
      </Link>
    )
  ), []);

  return (
    <div className={styles.specBlock}>
      <div className={styles.entityHeader}>
        <img
          className={classNames(styles.entityPicture, {
            [styles.entityPictureActive]: !!src
          })}
          src={src}
          alt="avatar"
        />
        <div className={styles.titleBlock}>
          <Title className={styles.title} level={3}>
            {title}
          </Title>
          {shortTitle && (
            <Text className={styles.shortTitle}>
              {shortTitle}
            </Text>
          )}
        </div>
        <div className={styles.socialBlock}>
          {socialLinksView}
        </div>
      </div>
      <div className={styles.descriptionBlock}>
        {description && (
          <Text className={descriptionClass}>
            {description}
          </Text>
        )}
        {showMoreBtn}
        <div className={styles.navigationGrid}>
          <Tabs
            classNames={{
              root: styles.TabsRoot,
              tab: '',
              selectedTabs: '',
              label: styles.TabLabel,
              selectedLabel: styles.TabLabelSelected
            }}
            selectedId={currentTab}
            tabs={tabData}
            onClick={(id: number) => {
              setCurrentTab(id);
              navigate(routes[id]);
            }}
          />
          {settings}
        </div>
      </div>
    </div>
  );
}

export default EntityHeader;
