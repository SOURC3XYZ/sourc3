import { Button } from 'antd';
import style from './beam-btn.module.css';

type BeamButtonProps = {
  callback: () => void;
  title: string;
};

const BeamButton = ({ title, callback }:BeamButtonProps) => (
  <div className={style.beamButton}>
    <Button type="primary" onClick={callback}>{title}</Button>
  </div>
);
export default BeamButton;
