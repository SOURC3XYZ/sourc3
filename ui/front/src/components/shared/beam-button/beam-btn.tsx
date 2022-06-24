import { ReactNode } from 'react';
import styles from './beam-btn.module.scss';

type BeamButtonProps = {
  callback: () => void;
  children: ReactNode;
  classes?: string;
  isDisabled?: boolean;
};

function BeamButton({ children, classes = '', callback, isDisabled }:BeamButtonProps) {
  const className = [classes, styles.button].join(' ');
  return (
    <button
      className={className}
      type="button"
      onClick={callback}
      disabled={isDisabled}
    >
      {children}
    </button>
  );
}
export default BeamButton;
