import React, {
} from 'react';
import { useSelector } from '@libs/redux';
import styles from './avatar.module.scss';

type AvatarProps = {
  small?: boolean,
  url?: string,
  medium?: boolean,
};
function Avatar({ small, url, medium }: AvatarProps) {
  const src = useSelector((state) => state.profile.data.github_profile.avatar_url);
  // const [src, setSrc] = useState<string | null>(null);

  return (
    <img
      className={small ? styles.small : medium ? styles.medium : styles.avatar}
      src={url || src}
      alt="avatar"
      loading="lazy"
      crossOrigin="anonymous"
    />
  );
}

export default Avatar;
