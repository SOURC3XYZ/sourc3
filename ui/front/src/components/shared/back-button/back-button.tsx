import React, { CSSProperties } from 'react';
import { IconBackArrow } from '@components/svg';
import { useNavigate } from 'react-router-dom';
import styles from './back-button.module.scss';

type buttonProps = {
  link?: string;
  onClick?: () => void;
  inlineStyles?: CSSProperties
};

function BackButton({
  link, onClick, inlineStyles
}: buttonProps) {
  const navigate = useNavigate();
  const onClickHandler = () => link && navigate(link);

  return (
    <button
      className={styles.button}
      type="button"
      onClick={onClick || onClickHandler}
      style={inlineStyles}
    >
      <IconBackArrow />
      Back
    </button>
  );
}

export default BackButton;
