type IconProps = {
  fill?: string;
  className?: string;
};

function IconGitLogo({ fill = 'black', className = '' }:IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="8" fill={fill} />
      <path d="M8 2C4.70447 2 2 4.70447 2 8C2 10.8122 3.97333 13.3668 6.59375 14V12.015C6.33411 12.0718 6.09515 12.0735 5.83084 11.9955C5.47626 11.8909 5.18814 11.6547 4.97427 11.2945C4.83795 11.0645 4.59634 10.8152 4.3443 10.8335L4.2825 10.1331C4.82751 10.0864 5.29901 10.4651 5.57889 10.9354C5.70322 11.1445 5.84631 11.2671 6.02997 11.3213C6.20749 11.3735 6.3981 11.3484 6.62021 11.27C6.67596 10.8253 6.87967 10.6589 7.03357 10.4245V10.4241C5.47076 10.191 4.84793 9.36194 4.60074 8.70752C4.27316 7.83859 4.44894 6.75305 5.0282 6.06705C5.03946 6.05368 5.05978 6.01871 5.05191 5.99426C4.78632 5.19199 5.10995 4.52832 5.12186 4.45792C5.42838 4.54855 5.47818 4.36673 6.45331 4.95917L6.62186 5.06042C6.69235 5.10245 6.6702 5.07846 6.74069 5.07315C7.14783 4.96255 7.57703 4.90149 7.99991 4.896C8.42599 4.90149 8.85245 4.96255 9.27643 5.07764L9.33099 5.08313C9.32623 5.0824 9.34583 5.07965 9.37869 5.06006C10.5968 4.32224 10.553 4.56339 10.8797 4.45718C10.8915 4.52768 11.2108 5.20215 10.9481 5.99426C10.9127 6.10339 12.0042 7.10287 11.3992 8.70724C11.152 9.36194 10.5292 10.191 8.96643 10.4241V10.4245C9.16675 10.7298 9.40744 10.8922 9.40616 11.5221V14C12.0267 13.3668 13.9999 10.8122 13.9999 8C14 4.70447 11.2955 2 8 2V2Z" fill="white" />
    </svg>

  );
}

export default IconGitLogo;
