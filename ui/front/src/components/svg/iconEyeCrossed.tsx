type IconCloseCrossProps = {
  fill?: string;
  className?: string;
};

function IconEyeCrossed({ fill = 'rgba(0,0,0)', className = '' }:IconCloseCrossProps) {
  return (
    <svg
      className={className}
      width="22"
      height="23"
      viewBox="0 0 22 23"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill} fillRule="evenodd">
        <g fillRule="nonzero">
          <path d="M21.86 11.093c-.196-.268-4.88-6.572-10.86-6.572C5.019 4.52.336 10.825.14 11.093a.724.724 0 0 0 0 .855c.196.268 4.879 6.573 10.86 6.573 5.98 0 10.664-6.305 10.86-6.573a.723.723 0 0 0 0-.855zM11 17.073c-4.406 0-8.221-4.185-9.35-5.553C2.776 10.15 6.584 5.969 11 5.969c4.405 0 8.22 4.183 9.35 5.552-1.127 1.37-4.935 5.551-9.35 5.551z" />
          <path d="M10.71 7.437c-2.394 0-4.342 1.963-4.342 4.375 0 2.413 1.948 4.375 4.343 4.375 2.394 0 4.342-1.962 4.342-4.375 0-2.412-1.948-4.375-4.342-4.375zm0 7.292c-1.596 0-2.894-1.309-2.894-2.917 0-1.608 1.298-2.916 2.895-2.916 1.596 0 2.894 1.308 2.894 2.916 0 1.608-1.298 2.917-2.894 2.917z" />
        </g>
        <rect transform="rotate(50 10.835 12)" x="9.835" width="2" height="24" rx="1" />
      </g>
    </svg>

  );
}

export default IconEyeCrossed;