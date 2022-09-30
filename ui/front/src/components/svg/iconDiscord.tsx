type IconDiscordProps = {
  fill?: string;
  className?: string;
};

function IconDiscord({ fill = 'black', className = '' }:IconDiscordProps) {
  return (
  // eslint-disable-next-line max-len
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* eslint-disable-next-line max-len */}
      <path d="M9.88092 2.83984C9.74852 3.07697 9.63053 3.32186 9.52759 3.57318C8.5161 3.41321 7.48575 3.41321 6.47425 3.57318C6.37131 3.32186 6.25332 3.07697 6.12092 2.83984C5.16811 3.00264 4.24186 3.2942 3.36759 3.70651C1.80422 5.9627 1.09521 8.70181 1.36759 11.4332C2.38641 12.1991 3.52989 12.7832 4.74759 13.1598C5.02486 12.7936 5.27232 12.4057 5.48759 11.9998C5.0903 11.8534 4.70845 11.668 4.34759 11.4465C4.44656 11.3807 4.54019 11.3071 4.62759 11.2265C5.67989 11.7334 6.8329 11.9966 8.00092 11.9966C9.16894 11.9966 10.3219 11.7334 11.3743 11.2265C11.4676 11.3065 11.5609 11.3798 11.6543 11.4465C11.2914 11.6663 10.91 11.8537 10.5143 12.0065C10.7206 12.4215 10.9614 12.8185 11.2343 13.1932C12.4504 12.8179 13.5919 12.2336 14.6076 11.4665C14.8865 8.73465 14.1769 5.9933 12.6076 3.73984C11.7431 3.319 10.826 3.01629 9.88092 2.83984V2.83984ZM5.78759 9.87318C5.45398 9.84923 5.14262 9.69697 4.91887 9.44836C4.69512 9.19975 4.57638 8.87413 4.58759 8.53984C4.57469 8.20512 4.69285 7.87857 4.91693 7.62958C5.14101 7.3806 5.45336 7.22882 5.78759 7.20651C6.12181 7.22882 6.43416 7.3806 6.65825 7.62958C6.88233 7.87857 7.00048 8.20512 6.98759 8.53984C7.00048 8.87457 6.88233 9.20112 6.65825 9.4501C6.43416 9.69908 6.12181 9.85086 5.78759 9.87318V9.87318ZM10.2143 9.87318C9.88064 9.84923 9.56928 9.69697 9.34553 9.44836C9.12179 9.19975 9.00305 8.87413 9.01425 8.53984C9.00136 8.20512 9.11951 7.87857 9.3436 7.62958C9.56768 7.3806 9.88003 7.22882 10.2143 7.20651C10.5491 7.22716 10.8625 7.37844 11.0869 7.62781C11.3113 7.87717 11.4289 8.20468 11.4143 8.53984C11.4289 8.87501 11.3113 9.20252 11.0869 9.45188C10.8625 9.70124 10.5491 9.85253 10.2143 9.87318V9.87318Z" fill={fill} />
    </svg>

  );
}

export default IconDiscord;