import { Spin } from 'antd';
import styles from './preload.module.scss';

type PreloadProps = {
  message: string;
  isOnLendos?: boolean;
  className?:string;
};

function Preload({
  message,
  isOnLendos,
  className = ''
}:PreloadProps) {
  const wrapperClassname = [className, styles.loaderWrapper].join(' ');
  const messageClassName = isOnLendos ? styles.message : styles.messageWhiteBg;
  return (
    <div className={wrapperClassname}>
      <div className={styles.content}>
        <Spin className={styles.spin} />
        <div className={messageClassName}>{message}</div>
      </div>
    </div>
  );
}

export default Preload;
