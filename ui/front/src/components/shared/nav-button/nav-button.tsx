import { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './button.module.scss';

type buttonProps = {
  name: string;
  isDisabled?:boolean;
  link?: string;
  onClick?: () => void
  inlineStyles?: CSSProperties
  active?: boolean
  classes?: string
};
function NavButton({
  name, link, inlineStyles, isDisabled, onClick, active = false, classes
}:buttonProps) {
  const navigate = useNavigate();
  const className = [classes, (active ? styles.button : styles.buttonSecond)].join(' ');
  const onClickHandler = () => link && navigate(link);
  return (
    <button
      className={className}
      disabled={isDisabled}
      style={inlineStyles}
      // autoFocus={active}
      // className={active ? styles.button : styles.buttonSecond}
      type="button"
      onClick={onClick || onClickHandler}
    >
      { name }
    </button>

  );
}
export default NavButton;
