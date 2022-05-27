import { Button } from 'antd';
import { Link } from 'react-router-dom';
import styles from './button.module.css';

type buttonProps = {
  link?: string;
  name?: string;
  onClick?:()=>void
  isDisabled?: boolean
  type?:
  'link' |
  'text' |
  'ghost' |
  'default' |
  'primary' |
  'dashed'
  | undefined
};
const NavButton = ({
  link, name, onClick, isDisabled, type
}:buttonProps) => (
  <div className={isDisabled
    ? `${styles.button} ${styles.disabled}` : `${styles.button}`}
  >
    {link ? (
      <Button
        type={type || 'default'}
        onClick={onClick}
      >
        <Link
          to={link}
        >
          {name}
        </Link>
      </Button>
    ) : (
      <Button
        type={type || 'default'}
        onClick={onClick}
      >
        { name }
      </Button>
    )}
  </div>
);
export default NavButton;
