type IconLocationProps = {
  fill?: string;
  className?: string;
};

function IconLocation({ fill = 'rgba(0,0,0,0.5)', className = '' }:IconLocationProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_3703_1141)">
        {/* eslint-disable-next-line max-len */}
        <path d="M8.00065 1.3335C5.42065 1.3335 3.33398 3.42016 3.33398 6.00016C3.33398 9.50016 8.00065 14.6668 8.00065 14.6668C8.00065 14.6668 12.6673 9.50016 12.6673 6.00016C12.6673 3.42016 10.5807 1.3335 8.00065 1.3335ZM8.00065 7.66683C7.08065 7.66683 6.33398 6.92016 6.33398 6.00016C6.33398 5.08016 7.08065 4.3335 8.00065 4.3335C8.92065 4.3335 9.66732 5.08016 9.66732 6.00016C9.66732 6.92016 8.92065 7.66683 8.00065 7.66683Z" fill={fill} />
      </g>
      <defs>
        <clipPath id="clip0_3703_1141">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>

  );
}

export default IconLocation;
