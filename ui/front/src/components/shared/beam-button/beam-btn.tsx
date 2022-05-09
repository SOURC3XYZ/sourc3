import { ReactNode } from 'react';
import style from './beam-btn.module.scss';

type BeamButtonProps = {
  callback: () => void;
  children: ReactNode;
  classes?: string;
};

function BeamButton({ children, classes = '', callback }:BeamButtonProps) {
  const className = [classes, style.button].join(' ');
  return (
    <button className={className} type="button" onClick={callback}>
      {children}
    </button>
  );
}
export default BeamButton;
