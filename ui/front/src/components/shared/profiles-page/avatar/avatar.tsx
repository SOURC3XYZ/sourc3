import React, {
  useMemo, useState
} from 'react';
import { useUpload } from '@libs/hooks/shared';
import { useSelector } from '@libs/redux';
import styles from './avatar.module.scss';

type AvatarProps = {
  small?: boolean,
  url?: string
};
function Avatar({ small, url }: AvatarProps) {
  const profile = useSelector((state) => state.sc3Frofile);

  const [src, setSrc] = useState<string | null>(null);
  const { getImgUrlFromIpfs } = useUpload();
  useMemo(async () => {
    const image = await getImgUrlFromIpfs(profile.user_avatar_ipfs_hash);
    setSrc(image);
  }, [profile.user_avatar_ipfs_hash]);
  return (
    <img
      className={small ? styles.small : styles.avatar}
      src={url || src}
      alt={src || 'avatar'}
    />
  );
}

export default Avatar;
