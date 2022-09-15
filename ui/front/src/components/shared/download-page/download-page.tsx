import img from '@assets/img/source-header-logo-alpha.svg';
import { Link } from 'react-router-dom';
import { CONFIG } from '@libs/constants';
import styles from './download.module.scss';

import illustration from '../../../assets/icons/illustration2.svg';
import semisquare from '../../../assets/icons/semisquare.svg';
import circle2 from '../../../assets/icons/circle2.svg';
import square from '../../../assets/icons/square.svg';
import semisquare2 from '../../../assets/icons/semisquare2.svg';
import arrow2 from '../../../assets/icons/arrow2.svg';
import chrome from '../../../assets/img/chrome.png';
import opera from '../../../assets/img/opera.png';
import brave from '../../../assets/img/brave.png';
import microsoft from '../../../assets/img/microsoft.png';
import profile from '../../../assets/img/profile.png';

function DownloadPage() {
  return (
    <div className={styles.section}>
      <Link to="/">
        <img className={styles.logo} alt="source" src={img} />
      </Link>
      <div className={styles.text}>
        <div className={styles.img}>
          <img src={illustration} alt="illustration" />
          <img src={semisquare} alt="semisquare" />
          <img src={circle2} alt="circle" />
          <img src={square} alt="square" />
          <img src={arrow2} alt="arrow" />
          <img src={semisquare2} alt="semisquare" />
        </div>

        <h1>The easiest way to Build the Web3 way</h1>
        <img className={styles.profile} src={profile} alt="profile" />
        <Link
          to={CONFIG.BIN_REPO as string}
          className={styles.button}
        >
          Install SOURC3 web extension

        </Link>
      </div>
      <div className={styles.browsers}>
        <h4>Supported browsers</h4>
        <div className={styles.items}>
          <div>
            <img src={chrome} alt="chrome" />
            <p>Chrome</p>
          </div>
          <div>
            <img src={opera} alt="opera" />
            <p>Opera</p>
          </div>
          <div>
            <img src={brave} alt="brave" />
            <p>Brave</p>
          </div>
          <div>
            <img src={microsoft} alt="Edge" />
            <p>Edge</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DownloadPage;
