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

const socialLinksData = new Map<keyof SocialLinks, React.FC>()
  .set('discord', () => <DiscordIcon className={styles.icon} />)
  .set('telegram', () => <TelegramIcon className={styles.icon} />)
  .set('twitter', () => <TwitterIcon className={styles.icon} />)
  .set('instagram', () => <InstagrammIcon className={styles.icon} />)
  .set('linkedin', () => <LinkedinIcon className={styles.icon} />);

function SocialLinkHOC({ Component, key, link }: {
  Component: React.FC,
  key: string,
  link: string
}) {
  return (
    <a
      className={styles.icon}
      key={key}
      href={`http://${link}`}
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
      const [key, link] = el;
      const Component = socialLinksData.get(key);
      if (!Component) return null;
      return SocialLinkHOC({ key, link, Component });
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
