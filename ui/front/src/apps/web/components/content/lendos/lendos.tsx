import img from '@assets/img/source-logo.svg';
import styles from './lendos.module.scss';

const Lendos = () => {
  console.log(img);
  return (
    <div className={styles.bg}>
      <img alt="source-logo" src={img} />
      <div className={styles.intro}>
        <h1>
          Where Web3
          Builds.
        </h1>
        <p>
          SOURC3 is a decentralized software development platform, enabling self-sovereignty and recognizing contribution.
        </p>
        <button type="button">Explore</button>
      </div>
    </div>
  );
};

export default Lendos;
