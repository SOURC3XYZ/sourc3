import React from 'react';
import { IconBackArrow } from '@components/svg';
import { useNavigate } from 'react-router-dom';
import styles from './back-button.module.scss';

type buttonProps = {
  link?: string;
  onClick?: () => void
};

function BackButton({
  link, onClick
}: buttonProps) {
  const navigate = useNavigate();
  const onClickHandler = () => link && navigate(link);

  return (
    <button
      className={styles.button}
      type="button"
      onClick={onClick || onClickHandler}
    >
      <IconBackArrow />
      Back
    </button>
  );
}

export default BackButton;
