/* eslint-disable max-len */
import img from '@assets/img/source-logo.svg';
import { GitConnectAuth } from '@components/shared/git-auth';
import { LOCAL_STORAGE_ITEMS } from '@libs/constants';
import { useSelector } from '@libs/redux';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
// import { useNavigate } from 'react-router-dom';
// import { useNavigate } from 'react-router-dom';
import styles from './lendos.module.scss';

function Lendos() {
  // const [toggle, setToggle] = useState(false);
  const navigate = useNavigate();
  // const onClick = () => navigate('/repos/all/1', { replace: false });

  const authData = useSelector((state) => state.profile.data);

  const isAuth = !!authData.token;

  const buttons = useMemo(() => {
    if (!isAuth) return <div className={styles.afterConnect}><GitConnectAuth why name="Connect Github" /></div>;
    const goToOnboarding = () => {
      const step = localStorage.getItem('onbording_step');
      navigate(`/onboarding${step ? `?${LOCAL_STORAGE_ITEMS.ONBOARDING_STEP}=${step}` : ''}`);
    };
    const goToProfile = () => navigate(`/profile/${authData.github_login}`);

    return (
      <div className={styles.afterConnect}>
        <button className={styles.button} type="button" onClick={goToOnboarding}>Continue onboarding</button>
        <button className={styles.button} type="button" onClick={goToProfile}>Back to my profile</button>
      </div>
    );
  }, [authData, isAuth]);

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
          {buttons}

        </div>
      </div>
    </div>
  );
}

export default Lendos;
