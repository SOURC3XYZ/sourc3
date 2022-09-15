import React, {
} from 'react';
import { useSelector } from '@libs/redux';
import { useNavigate } from 'react-router-dom';
import styles from './avatar.module.scss';

type AvatarProps = {
  small?: boolean,
  url?: string
};
function Avatar({ small, url }: AvatarProps) {
  const src = useSelector((state) => state.profile.data.github_profile.avatar_url);
  const id = useSelector((state) => state.profile.data.id);
  const navigate = useNavigate();
  // const [src, setSrc] = useState<string | null>(null);

  return (
    <img
      onClick={() => { navigate(`/profile/${id}`); }}
      className={small ? styles.small : styles.avatar}
      src={url || src}
      alt="avatar"
      loading="lazy"
      crossOrigin="anonymous"
    />
  );
}

export default Avatar;
