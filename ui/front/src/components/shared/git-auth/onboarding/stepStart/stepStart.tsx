/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable max-len */
import early from '@assets/icons/early-adopter.svg';
import arrow from '@assets/icons/arrow2.svg';
import ellipse from '@assets/icons/ellipse.svg';
import { NavButton } from '@components/shared';
import { useSelector } from '@libs/redux';
import { useNavigate } from 'react-router-dom';
import { LOCAL_STORAGE_ITEMS } from '@libs/constants';
import styles from './stepStart.module.scss';

type StepStartProps = {
  callback: () => void;
};

function stepStart({ callback }:StepStartProps) {
  const { github_profile, github_login, id } = useSelector((state) => state.profile.data);

  const navigate = useNavigate();

  const handleGoToStep = (step: number) => {
    window.scrollTo({ top: 0 });
    navigate(`/onboarding?${LOCAL_STORAGE_ITEMS.ONBOARDING_STEP}=${step}`);
  };

  return (
    <div className={styles.section}>
      <div className={styles.title}>
        <div className={styles.img}>
          <img className={styles.arrow} src={arrow} alt="" />
          <img className={styles.ellipse} src={ellipse} alt="" />
        </div>
        <h1>
          <span className={styles.indent}>
            <span>{`${github_profile.name || github_login}`}</span>
            , thank you
            {' '}
          </span>
          <span className={styles.drop}>
            for joining&nbsp;
            <a href="/">SOURC3</a>
            {' '}
            &nbsp;and&nbsp;
          </span>
          the community shaping
          {' '}
          <span className={styles.green}>the new web</span>
          !
        </h1>
        <img src={early} alt="early adopter" />
      </div>
      <div className={styles.count}>
        <h4>You ARE builder</h4>
        <div className={styles.countNum}><h4>{`#${id}`}</h4></div>
        <h4>to join sourc3</h4>
      </div>
      <div className={styles.text}>
        <p>
          <span className={styles.drop}>As an early adopter you will be eligible to receive exclusive benefits</span>
          {' '}
          including airdrops, and early access to new features and products.
        </p>
        <p>
          To enjoy the best SOURC3 experience, complete the following 3 steps:
          <span className={styles.drop}>
            <span
              className={styles.color}
              onClick={() => handleGoToStep(0)}
            >
              future proof your reputation

            </span>
            ,
            {' '}
            <span
              className={styles.color}
              onClick={() => handleGoToStep(1)}
            >
              join the community

            </span>
            {' '}
            and
            {' '}
            <span
              className={styles.color}
              onClick={() => handleGoToStep(2)}
            >
              spread the word

            </span>
            .
          </span>
        </p>
      </div>
      <NavButton
        name="Get started"
        onClick={callback}
      />
    </div>
  );
}

export default stepStart;
