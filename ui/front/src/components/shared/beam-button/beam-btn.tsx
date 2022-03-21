import { ReactNode } from 'react';
import style from './beam-btn.module.scss';

type BeamButtonProps = {
  callback: () => void;
  children: ReactNode;
};

const BeamButton = ({ children, callback }:BeamButtonProps) => (
  <button className={style.button} type="button" onClick={callback}>
    {children}
  </button>
);
export default BeamButton;
