import Title from 'antd/lib/typography/Title';
import { EntityManager, NavItem, Tabs } from '@components/shared';
import { OwnerListType } from '@types';
import { useUpload } from '@libs/hooks/shared';
import {
  useCallback, useEffect, useMemo, useState
} from 'react';
import Text from 'antd/lib/typography/Text';
import styles from './entity-wrapper.module.scss';
import {
  DiscordIcon, InstagrammIcon, LinkedinIcon, TelegramIcon, TwitterIcon
} from '../icons/social';

type HeaderFields = {
  shortTitle?:string,
  avatar: string,
  email: string,
  description: string,
  website: string
  twitter: string,
  instagram: string,
  telegram: string,
  linkedin: string,
  discord: string
};

type EntityWrapperProps = {
  title: string;
  headerFields?: HeaderFields
  type: OwnerListType;
  pkey:string;
  searchText: string;
  navItems: NavItem[];
  children:JSX.Element;
  placeholder: string;
  setInputText:(str: string) => void
  showModal?: () => void;
};

const tabData = [
  {
    id: 0,
    label: 'Projects'
  },
  {
    id: 1,
    label: 'Repositories'
  },
  {
    id: 2,
    label: 'Issues'
  },
  {
    id: 3,
    label: 'Members'
  },
  {
    id: 4,
    label: 'Fork'
  },
  {
    id: 5,
    label: 'Pull requests'
  }
];

function EntityWrapper({
  title,
  headerFields,
  type,
  pkey,
  searchText,
  navItems,
  children,
  placeholder,
  showModal,
  setInputText
}:EntityWrapperProps) {
  const [showMore, setShowMore] = useState(false);
  const [src, setSrc] = useState<string | undefined>(undefined);
  const [currentTab, setCurrentTab] = useState(0);

  const { getImgUrlFromIpfs } = useUpload();

  const handleLoadPic = useCallback(async () => {
    if (headerFields?.avatar) {
      const link = await getImgUrlFromIpfs(headerFields.avatar);
      if (link) setSrc(link);
    }
  }, []);

  useEffect(() => {
    handleLoadPic();
  }, []);

  const showMoreBtn = useMemo(() => {
    const text = showMore ? 'Show less' : 'Show more';
    const onChangeHandler = () => {
      setShowMore((prev) => !prev);
    };
    return (
      <button className={styles.showMoreBtn} type="button" onClick={onChangeHandler}>
        {text}
      </button>
    );
  }, [showMore]);

  const descriptionClass = showMore ? styles.descriptionActive : styles.description;

  const header = useMemo(() => headerFields && (
    <div className={styles.specBlock}>
      <div className={styles.entityHeader}>
        <img className={styles.entityPicture} src={src} alt="avatar" />
        <div className={styles.titleBlock}>
          <Title className={styles.title} level={3}>
            {title}
          </Title>
          {headerFields.shortTitle && (
            <Text className={styles.shortTitle}>
              {headerFields.shortTitle}
            </Text>
          )}
        </div>
        <div className={styles.socialBlock}>
          {headerFields.discord && <DiscordIcon className={styles.icon} />}
          {headerFields.twitter && <TwitterIcon className={styles.icon} />}
          {headerFields.instagram && <InstagrammIcon className={styles.icon} />}
          {headerFields.linkedin && <LinkedinIcon className={styles.icon} />}
          {headerFields.telegram && <TelegramIcon className={styles.icon} />}
        </div>
      </div>
      <div className={styles.descriptionBlock}>
        {headerFields.description && (
          <Text className={descriptionClass}>
            {headerFields.description}
          </Text>
        )}
        {showMoreBtn}
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
          onClick={(id: number) => setCurrentTab(id)}
        />
      </div>
    </div>
  ), [src, showMore, currentTab]);

  return (
    <div className={styles.content}>
      {header}
      <EntityManager
        type={type}
        pkey={pkey}
        searchText={searchText}
        navItems={navItems}
        setInputText={setInputText}
        placeholder={placeholder}
        showModal={showModal}
      />
      {children}
    </div>
  );
}

export default EntityWrapper;
