type IconCloseCrossProps = {
  fill?: string;
//   className?: string;
};

function IconCloseCross({ fill = 'black' }:IconCloseCrossProps) {
  return (
    <svg width="25" height="22" viewBox="0 0 25 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="7.12109" y="3" width="19" height="3" transform="rotate(45 7.12109 3)" fill={fill} />
      <rect x="5" y="16.4346" width="19" height="3" transform="rotate(-45 5 16.4346)" fill={fill} />
    </svg>

  );
}

export default IconCloseCross;
