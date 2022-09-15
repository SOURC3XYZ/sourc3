type IconProps = {
  fill?: string;
  className?: string;
};

function IconStar({ fill = 'rgba(0,0,0,0.5)', className = '' }:IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path opacity="0.5" d="M8.25406 11.0173L8 10.8674L7.74594 11.0173L4.43354 12.9714L5.30834 9.30608L5.3797 9.00707L5.14511 8.80842L2.24439 6.35221L6.07432 6.03461L6.37264 6.00987L6.49173 5.73523L8 2.25684L9.50827 5.73523L9.62736 6.00987L9.92568 6.03461L13.7556 6.35221L10.8549 8.80842L10.6203 9.00707L10.6917 9.30608L11.5665 12.9714L8.25406 11.0173Z" fill="black" stroke={fill} />
    </svg>

  );
}

export default IconStar;
