/* eslint-disable max-len */
import img from '@assets/img/source-logo.svg';
import { GitConnectAuth } from '@components/shared/git-auth';
import { useNavigate } from 'react-router-dom';
import styles from './lendos.module.scss';

function Lendos() {
  const navigate = useNavigate();
  const onClick = () => navigate('/repos/all/1', { replace: false });
  return (
    <div className={styles.bg}>
      <div className={styles.wrapper}>
        <div className={styles.logo}>
          <img alt="source-logo" src={img} />
        </div>
        <div className={styles.intro}>
          <h1>
            Building
            <br />
            the Web3 way
          </h1>
          <p>
            SOURC3 is a Web3-native, decentralized platform for on-chain reputation management.
            <br />
            <br />
            Connect your GitHub to bring your contributions on-chain.
          </p>
          {/* <button className={styles.button} onClick={onClick} type="button">Explore</button> */}
          <GitConnectAuth why name="Connect Github" />
        </div>
      </div>
    </div>
  );
}

export default Lendos;
