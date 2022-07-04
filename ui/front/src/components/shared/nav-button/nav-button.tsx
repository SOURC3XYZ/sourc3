import { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import style from './button.module.scss';

type buttonProps = {
  name: string;
  isDisabled?:boolean;
  link?: string;
  onClick?: () => void
  inlineStyles?: CSSProperties
  active?: boolean
};
function NavButton({
  name, link, inlineStyles, isDisabled, onClick, active
}:buttonProps) {
  const navigate = useNavigate();

  const onClickHandler = () => link && navigate(link);
  return (
    <button
      disabled={isDisabled}
      style={inlineStyles}
      autoFocus={active}
      className={active ? style.button : style.buttonSecond}
      type="button"
      onClick={onClick || onClickHandler}
    >
      { name }
    </button>

  );
}
export default NavButton;
