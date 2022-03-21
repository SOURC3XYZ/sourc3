/* eslint-disable max-len */
import img from '@assets/img/source-logo.svg';
import { useNavigate } from 'react-router-dom';
import styles from './lendos.module.scss';

const Lendos = () => {
  const navigate = useNavigate();
  const onClick = () => navigate('/repos/all/1');

  console.log(img);
  return (
    <div className={styles.bg}>
      <div className={styles.wrapper}>
        <div className={styles.logo}>
          <img alt="source-logo" src={img} />
        </div>
        <div className={styles.intro}>
          <h1>
            Where Web3
            Builds.
          </h1>
          <p>
            SOURC3 is a decentralized software development platform, enabling self-sovereignty and recognizing contribution.
          </p>
          <button style={{ cursor: 'pointer' }} onClick={onClick} type="button">Explore</button>
        </div>
      </div>
    </div>
  );
};

export default Lendos;
