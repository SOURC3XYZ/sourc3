/* eslint-disable max-len */
import img from '@assets/img/source-logo.svg';
import { GitConnectAuth } from '@components/shared/git-auth';
// import { useNavigate } from 'react-router-dom';
import styles from './lendos.module.scss';
import {useState} from "react";

function Lendos(props: any) {
  const [toggle, setToggle] = useState(false);
  // const navigate = useNavigate();
  // const onClick = () => navigate('/repos/all/1', { replace: false });
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

           {/*<div className={styles.afterConnect}>*/}
           {/*   <button className={styles.button} type="button" onClick={() => props.onClickHandler(2)}>Continue onboarding</button>*/}
           {/*   <button className={styles.button} type="button">Back to my profile</button>*/}
           {/* </div>*/}

        </div>
      </div>
    </div>
  );
}

export default Lendos;
