type IconCloseCrossProps = {
  fill?: string;
  className?: string;
};

function IconBackArrow({ fill = '#FF791F', className = '' }:IconCloseCrossProps) {
  return (
    <svg
      className={className}
      width="25"
      height="22"
      viewBox="0 0 25 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path fillRule="evenodd" clipRule="evenodd" d="M3.0012 10.4996L5.1223 8.37851L10.3787 3.12207L12.5001 5.24339L8.74384 8.99961H22.0002V11.9996H8.74339L12.4998 15.7561L10.3785 17.8774L3.00098 10.4998L3.0012 10.4996Z" fill={fill} />
    </svg>

  );
}

export default IconBackArrow;
