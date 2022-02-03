import { Button } from 'antd';
import { Link } from 'react-router-dom';
import styles from './button.module.css';

type buttonProps = {
  link?: string;
  name?: string;
  onClick?:()=>void
  isDisabled?: boolean
};
const NavButton = ({
  link, name, onClick, isDisabled
}:buttonProps) => (
  <div className={isDisabled
    ? `${styles.button} ${styles.disabled}` : `${styles.button}`}
  >
    {link ? (
      <Button
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
        onClick={onClick}
      >
        { name }
      </Button>
    )}
  </div>
);
export default NavButton;
