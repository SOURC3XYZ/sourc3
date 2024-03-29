type IconWebSiteProps = {
  fill?: string;
  className?: string;
};

function IconLinkedIn({ fill = 'black', className = '' }:IconWebSiteProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3.32195 4.79819C4.12755 4.79819 4.78061 4.14513 4.78061 3.33953C4.78061 2.53393 4.12755 1.88086 3.32195 1.88086C2.51635 1.88086 1.86328 2.53393 1.86328 3.33953C1.86328 4.14513 2.51635 4.79819 3.32195 4.79819Z" fill={fill} />
      <path d="M6.15717 5.90312V13.9958H8.66983V9.99379C8.66983 8.93779 8.8685 7.91512 10.1778 7.91512C11.4692 7.91512 11.4852 9.12246 11.4852 10.0605V13.9965H13.9992V9.55846C13.9992 7.37846 13.5298 5.70312 10.9818 5.70312C9.7585 5.70312 8.9385 6.37446 8.60317 7.00979H8.56917V5.90312H6.15717ZM2.0625 5.90312H4.57917V13.9958H2.0625V5.90312Z" fill={fill} />
    </svg>

  );
}

export default IconLinkedIn;
