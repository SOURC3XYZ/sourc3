type IconWebSiteProps = {
  fill?: string;
  className?: string;
};

function IconInstargam({ fill = 'black', className = '' }:IconWebSiteProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13.9647 5.53664C13.958 5.03172 13.8635 4.53182 13.6854 4.0593C13.5309 3.66074 13.2951 3.29877 12.9928 2.99653C12.6906 2.69428 12.3286 2.45841 11.93 2.30397C11.4636 2.12888 10.9708 2.0342 10.4727 2.02397C9.83138 1.9953 9.62805 1.9873 8.00005 1.9873C6.37205 1.9873 6.16338 1.9873 5.52671 2.02397C5.02882 2.03427 4.53628 2.12895 4.07005 2.30397C3.67142 2.4583 3.30939 2.69413 3.00714 2.99639C2.70488 3.29865 2.46904 3.66068 2.31471 4.0593C2.13927 4.52539 2.0448 5.01804 2.03538 5.51597C2.00671 6.15797 1.99805 6.3613 1.99805 7.9893C1.99805 9.6173 1.99805 9.8253 2.03538 10.4626C2.04538 10.9613 2.13938 11.4533 2.31471 11.9206C2.4693 12.3191 2.70531 12.681 3.00767 12.9832C3.31003 13.2853 3.67209 13.521 4.07071 13.6753C4.53567 13.8574 5.0283 13.9589 5.52738 13.9753C6.16938 14.004 6.37271 14.0126 8.00071 14.0126C9.62871 14.0126 9.83738 14.0126 10.474 13.9753C10.9721 13.9655 11.465 13.871 11.9314 13.696C12.3298 13.5414 12.6917 13.3054 12.9939 13.0032C13.2962 12.701 13.5321 12.3391 13.6867 11.9406C13.862 11.474 13.956 10.982 13.966 10.4826C13.9947 9.8413 14.0034 9.63797 14.0034 8.0093C14.002 6.3813 14.002 6.17464 13.9647 5.53664V5.53664ZM7.99605 11.068C6.29338 11.068 4.91405 9.68864 4.91405 7.98597C4.91405 6.2833 6.29338 4.90397 7.99605 4.90397C8.81344 4.90397 9.59736 5.22868 10.1754 5.80667C10.7533 6.38466 11.078 7.16857 11.078 7.98597C11.078 8.80337 10.7533 9.58729 10.1754 10.1653C9.59736 10.7433 8.81344 11.068 7.99605 11.068V11.068ZM11.2007 5.50864C11.1063 5.50873 11.0128 5.4902 10.9256 5.45411C10.8384 5.41803 10.7591 5.36509 10.6923 5.29834C10.6256 5.23159 10.5727 5.15233 10.5366 5.0651C10.5005 4.97786 10.482 4.88437 10.482 4.78997C10.482 4.69564 10.5006 4.60223 10.5367 4.51508C10.5728 4.42792 10.6257 4.34874 10.6924 4.28203C10.7591 4.21533 10.8383 4.16242 10.9255 4.12632C11.0126 4.09022 11.106 4.07164 11.2004 4.07164C11.2947 4.07164 11.3881 4.09022 11.4753 4.12632C11.5624 4.16242 11.6416 4.21533 11.7083 4.28203C11.775 4.34874 11.8279 4.42792 11.864 4.51508C11.9001 4.60223 11.9187 4.69564 11.9187 4.78997C11.9187 5.1873 11.5974 5.50864 11.2007 5.50864Z" fill="black" />
      <path d="M7.99614 9.98838C9.10182 9.98838 9.99814 9.09205 9.99814 7.98638C9.99814 6.8807 9.10182 5.98438 7.99614 5.98438C6.89047 5.98438 5.99414 6.8807 5.99414 7.98638C5.99414 9.09205 6.89047 9.98838 7.99614 9.98838Z" fill={fill} />
    </svg>

  );
}

export default IconInstargam;
