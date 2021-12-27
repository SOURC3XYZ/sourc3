import { Spin } from 'antd';
import style from './preload.module.css';

const Preload = () => (
  <div className={style.loaderWrapper}>
    <Spin />
  </div>
);

export default Preload;
