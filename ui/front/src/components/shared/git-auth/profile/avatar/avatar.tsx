import React, {
} from 'react';
import { useSelector } from '@libs/redux';
import achievements from '@components/shared/git-auth/profile/achievements/achievements';
import styles from './avatar.module.scss';

type AvatarProps = {
  small?: boolean,
  url?: string,
  medium?: boolean,
  achievements?: boolean
};
function Avatar({
  small, url, medium, achievements
}: AvatarProps) {
  const src = useSelector((state) => state.profile.data.github_profile.avatar_url);
  // const [src, setSrc] = useState<string | null>(null);

  return (
    <img
      className={small ? styles.small : medium ? styles.medium : achievements ? styles.achievements : styles.avatar}
      src={url || src}
      alt="avatar"
      loading="lazy"
      crossOrigin="anonymous"
    />
  );
}

export default Avatar;
