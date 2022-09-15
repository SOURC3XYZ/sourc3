type IconProps = {
  fill?: string;
  className?: string;
};

function IconViewers({ fill = 'rgba(0,0,0,0.5)', className = '' }:IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_3699_537)">
        <path d="M7.99935 3C4.66602 3 1.81935 5.07333 0.666016 8C1.81935 10.9267 4.66602 13 7.99935 13C11.3327 13 14.1793 10.9267 15.3327 8C14.1793 5.07333 11.3327 3 7.99935 3ZM7.99935 11.3333C6.15935 11.3333 4.66602 9.84 4.66602 8C4.66602 6.16 6.15935 4.66667 7.99935 4.66667C9.83935 4.66667 11.3327 6.16 11.3327 8C11.3327 9.84 9.83935 11.3333 7.99935 11.3333ZM7.99935 6C6.89268 6 5.99935 6.89333 5.99935 8C5.99935 9.10667 6.89268 10 7.99935 10C9.10602 10 9.99935 9.10667 9.99935 8C9.99935 6.89333 9.10602 6 7.99935 6Z" fill={fill} />
      </g>
      <defs>
        <clipPath id="clip0_3699_537">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>

  );
}

export default IconViewers;
