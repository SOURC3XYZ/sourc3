import { useGetIpfsImage } from '@libs/hooks/shared';
import Avatar, { AvatarProps } from 'boring-avatars';
import classNames from 'classnames';
import styles from './ipfs-avatars.module.scss';

type IpfsAvatarProps = {
  ipfs?: string;
  colors: string[];
  name: string;
  size:number;
  square?: boolean;
  variant?: AvatarProps['variant'];
};

const IpfsAvatar = ({
  ipfs, size, colors, name, square, variant
}:IpfsAvatarProps) => {
  const src = useGetIpfsImage(ipfs);

  const image = ipfs ? (
    <img
      style={{
        width: `${size}px`,
        height: `${size}px`
      }}
      className={classNames(styles.entityPicture, {
        [styles.entityPictureActive]: !!src
      })}
      src={src ?? undefined}
      alt="avatar"
    />
  )
    : (
      <Avatar
        size={`${size}px`}
        square={square}
        variant={variant}
        name={name}
        colors={colors}
      />
    );

  return image;
};

export default IpfsAvatar;
