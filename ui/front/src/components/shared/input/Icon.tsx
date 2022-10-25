import React from 'react';
import {
  IconDiscord, IconLinkedIn, IconTelegram, IconTwitter, IconWebSite, IconInstagram
} from '@components/svg';

type IconProps = {
  icon: string,
  className: string
};

function IconSocial({ icon, className }:IconProps) {
  const renderIcon = (typeIcon:string) => {
    switch (typeIcon) {
      case 'telegram': {
        return (<IconTelegram className={className} />);
      }
      case 'website': {
        return (<IconWebSite className={className} />);
      }
      case 'twitter': {
        return (<IconTwitter className={className} />);
      }
      case 'discord': {
        return (<IconDiscord className={className} />);
      }
      case 'instagram': {
        return (<IconInstagram className={className} />);
      }
      case 'linkedin': {
        return (<IconLinkedIn className={className} />);
      }
      default: return null;
    }
  };

  return (renderIcon((icon))
  );
}

export default IconSocial;
