import img from '@assets/img/source-logo.svg';
import styles from './lendos.module.scss';

const Lendos = () => {
  console.log(img);
  return (
    <div className={styles.bg}>
      <img alt="source-logo" src={img} />
    </div>
  );
};

export default Lendos;
