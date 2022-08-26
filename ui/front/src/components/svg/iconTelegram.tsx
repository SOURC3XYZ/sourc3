type IconWebSiteProps = {
  fill?: string;
  className?: string;
};

function IconTelegram({ fill = 'black', className = '' }:IconWebSiteProps) {
  return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13.7771 2.47788L1.95706 7.03588C1.15039 7.35988 1.15506 7.80988 1.80906 8.01055L4.84372 8.95721L11.8651 4.52721C12.1971 4.32521 12.5004 4.43388 12.2511 4.65521L6.56239 9.78921H6.56106L6.56239 9.78988L6.35306 12.9179C6.65972 12.9179 6.79506 12.7772 6.96706 12.6112L8.44106 11.1779L11.5071 13.4425C12.0724 13.7539 12.4784 13.5939 12.6191 12.9192L14.6317 3.43388C14.8377 2.60788 14.3164 2.23388 13.7771 2.47788Z" fill={fill}/>
      </svg>

  );
}

export default IconTelegram;
