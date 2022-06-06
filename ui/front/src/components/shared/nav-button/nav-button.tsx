import { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import style from './button.module.scss';

type buttonProps = {
  name: string;
  isDisabled?:boolean;
  link?: string;
  onClick?: () => void
  inlineStyles?: CSSProperties
};
function NavButton({
  name, link, inlineStyles, isDisabled, onClick
}:buttonProps) {
  const navigate = useNavigate();

  const onClickHandler = () => link && navigate(link);
  return (
    <button
      disabled={isDisabled}
      style={inlineStyles}
      className={style.button}
      type="button"
      onClick={onClick || onClickHandler}
    >
      { name }
    </button>

  );
}
export default NavButton;
