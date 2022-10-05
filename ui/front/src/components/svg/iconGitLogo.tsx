type IconProps = {
  fill?: string;
  className?: string;
};

function IconGitLogo({ fill = 'black', className = '' }:IconProps) {
  return (
    <svg className={className} width="64" height="16" viewBox="0 0 64 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M64 8C64 3.58172 60.4183 0 56 0H0V12C0 14.2091 1.79086 16 4 16H64V8Z" fill={fill} />
      <path d="M13 3C10.2537 3 8 5.25372 8 8C8 10.3435 9.64445 12.4724 11.8282 13V11.3458C11.6118 11.3932 11.4127 11.3945 11.1924 11.3296C10.8969 11.2424 10.6568 11.0456 10.4786 10.7454C10.365 10.5538 10.1636 10.346 9.9536 10.3612L9.9021 9.77757C10.3563 9.73866 10.7492 10.0543 10.9824 10.4461C11.086 10.6204 11.2053 10.7225 11.3583 10.7677C11.5063 10.8113 11.6651 10.7904 11.8502 10.725C11.8967 10.3544 12.0664 10.2157 12.1947 10.0204V10.0201C10.8923 9.82587 10.3733 9.13495 10.1673 8.5896C9.89432 7.86549 10.0408 6.96088 10.5235 6.38921C10.5329 6.37807 10.5498 6.34892 10.5433 6.32855C10.3219 5.65999 10.5916 5.10693 10.6016 5.04826C10.857 5.12379 10.8985 4.97227 11.7111 5.46597L11.8516 5.55035C11.9103 5.58537 11.8919 5.56538 11.9506 5.56096C12.2899 5.4688 12.6476 5.41791 13 5.41333C13.355 5.41791 13.7104 5.4688 14.0637 5.5647L14.1092 5.56927C14.1052 5.56866 14.1216 5.56638 14.149 5.55005C15.1641 4.9352 15.1276 5.13615 15.3998 5.04765C15.4096 5.1064 15.6758 5.66846 15.4568 6.32855C15.4273 6.41949 16.3369 7.2524 15.8327 8.58937C15.6267 9.13495 15.1078 9.82587 13.8054 10.0201V10.0204C13.9723 10.2749 14.1729 10.4102 14.1718 10.9351V13C16.3556 12.4724 18 10.3435 18 8C18.0001 5.25372 15.7463 3 13 3V3Z" fill="white" />
      <path d="M25.675 12.1C25.0283 12.1 24.4667 11.9517 23.99 11.655C23.5133 11.3583 23.1467 10.935 22.89 10.385C22.6333 9.83167 22.505 9.17167 22.505 8.405C22.505 7.63167 22.6383 6.965 22.905 6.405C23.1717 5.845 23.5467 5.41667 24.03 5.12C24.5167 4.82 25.0867 4.67 25.74 4.67C26.14 4.67 26.5083 4.73667 26.845 4.87C27.185 5.00333 27.4817 5.18333 27.735 5.41C27.9917 5.63667 28.1933 5.895 28.34 6.185C28.4867 6.475 28.5683 6.77667 28.585 7.09H27.3C27.2533 6.84333 27.1583 6.61667 27.015 6.41C26.875 6.2 26.6933 6.03167 26.47 5.905C26.25 5.77833 25.9983 5.715 25.715 5.715C25.3517 5.715 25.0267 5.80667 24.74 5.99C24.4567 6.17333 24.2333 6.46167 24.07 6.855C23.91 7.245 23.83 7.75167 23.83 8.375C23.83 8.86833 23.88 9.285 23.98 9.625C24.0833 9.96167 24.2233 10.2333 24.4 10.44C24.58 10.6433 24.7867 10.7917 25.02 10.885C25.2533 10.975 25.5 11.02 25.76 11.02C26.0133 11.02 26.2367 10.9767 26.43 10.89C26.6233 10.8033 26.7867 10.69 26.92 10.55C27.0567 10.41 27.1617 10.26 27.235 10.1C27.3117 9.93667 27.3567 9.77833 27.37 9.625L27.415 9.095H25.8V8.235L28.685 8.245V12H27.825V10.985C27.7017 11.1683 27.545 11.345 27.355 11.515C27.1683 11.685 26.9383 11.825 26.665 11.935C26.395 12.045 26.065 12.1 25.675 12.1ZM31.4157 6.83V12H30.2457V6.83H31.4157ZM31.4307 4.775V5.925H30.2257V4.775H31.4307ZM35.8253 7.69H34.6703L34.6753 10.655C34.6753 10.8083 34.692 10.9217 34.7253 10.995C34.762 11.065 34.8186 11.1117 34.8953 11.135C34.9753 11.155 35.082 11.165 35.2153 11.165H35.8503V11.935C35.7836 11.9617 35.682 11.985 35.5453 12.005C35.412 12.0283 35.232 12.04 35.0053 12.04C34.5953 12.04 34.277 11.9867 34.0503 11.88C33.827 11.77 33.672 11.615 33.5853 11.415C33.4986 11.215 33.4553 10.9767 33.4553 10.7V7.69H32.6153V6.83H33.4903L33.7953 5.295H34.6703V6.825H35.8253V7.69ZM41.9162 8.79H38.4162V12H37.2012V4.77H38.4162V7.755H41.9162V4.77H43.1312V12H41.9162V8.79ZM46.592 12.1C46.3386 12.1 46.0936 12.0633 45.857 11.99C45.6236 11.9133 45.4136 11.8033 45.227 11.66C45.0403 11.5133 44.892 11.3333 44.782 11.12C44.672 10.9067 44.617 10.6583 44.617 10.375V6.83H45.837V10.235C45.837 10.515 45.9253 10.745 46.102 10.925C46.282 11.105 46.552 11.195 46.912 11.195C47.2386 11.195 47.5003 11.11 47.697 10.94C47.8936 10.7667 47.992 10.5183 47.992 10.195V6.83H49.202V12H48.267L48.132 10.99C48.0686 11.2733 47.957 11.4967 47.797 11.66C47.6403 11.82 47.4553 11.9333 47.242 12C47.032 12.0667 46.8153 12.1 46.592 12.1ZM53.2813 12.1C53.0047 12.1 52.768 12.0633 52.5713 11.99C52.3747 11.9167 52.2097 11.8217 52.0763 11.705C51.9463 11.5883 51.8413 11.4633 51.7613 11.33C51.6847 11.1933 51.6263 11.0633 51.5863 10.94L51.4463 12H50.5513V4.57H51.7713V7.585C51.8247 7.485 51.898 7.385 51.9913 7.285C52.088 7.185 52.2047 7.09333 52.3413 7.01C52.478 6.92667 52.633 6.86 52.8063 6.81C52.983 6.75667 53.178 6.73 53.3913 6.73C54.0347 6.73 54.543 6.95833 54.9163 7.415C55.2897 7.87167 55.4763 8.53 55.4763 9.39C55.4763 9.93333 55.393 10.4083 55.2263 10.815C55.063 11.2217 54.818 11.5383 54.4913 11.765C54.168 11.9883 53.7647 12.1 53.2813 12.1ZM53.0313 11.205C53.3947 11.205 53.693 11.06 53.9263 10.77C54.1597 10.48 54.2763 10.01 54.2763 9.36C54.2763 8.79333 54.1663 8.365 53.9463 8.075C53.7263 7.78167 53.4163 7.635 53.0163 7.635C52.7297 7.635 52.4947 7.7 52.3113 7.83C52.1313 7.96 51.9963 8.15333 51.9063 8.41C51.8197 8.66667 51.7747 8.98333 51.7713 9.36C51.7713 10.02 51.8713 10.4933 52.0713 10.78C52.2747 11.0633 52.5947 11.205 53.0313 11.205Z" fill="white" />
    </svg>

  );
}

export default IconGitLogo;