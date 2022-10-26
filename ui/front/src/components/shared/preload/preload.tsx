import orange from '@assets/img/orange.svg';
import styles from './preload.module.scss';

type PreloadProps = {
  message: string;
  isOnLendos?: boolean;
  className?:string;
  messageBlack?:boolean
};

function Preload({
  message,
  isOnLendos,
  className = '',
  messageBlack
}:PreloadProps) {
  const wrapperClassname = [className, styles.loaderWrapper].join(' ');
  const messageClassName = isOnLendos ? styles.message : messageBlack ? styles.messageBlack : styles.messageWhiteBg;
  return (
    <div className={wrapperClassname}>
      <div className={styles.content}>
        <img alt="spinner" src={orange} className={styles.spin} />
        <div className={messageClassName}>{message}</div>
      </div>
      {/* <div className={styles.version}>
        <h4>v01.73803.822</h4>
      </div> */}
    </div>
  );
}

export default Preload;
