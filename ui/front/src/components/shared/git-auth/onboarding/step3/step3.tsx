import { NavButton } from '@components/shared';
import { useNavigate } from 'react-router-dom';
import { useSelector } from '@libs/redux';
import { copyRefLink } from '@components/shared/referral-programm/referralProgramm';
import styles from './step.module.scss';

function Step3() {
  const navigate = useNavigate();
  const { github_login, id } = useSelector((state) => state.profile.data);
  const handleCopyLink = () => copyRefLink(id);
  return (
    <div className={styles.section}>
      <div className={styles.step}>
        <div className={styles.content}>
          <h1>
            Help others to bring their
            {' '}
            <span className={styles.drop}>
              reputation&nbsp;
              <span className={styles.color}>on-chain</span>
            </span>
          </h1>
          <div className={styles.text}>
            <p>
              We’re sure you have friends and contacts who will benefit from
              {' '}
              <span className={styles.drop}>building the Web3 way? </span>
            </p>
            <p>
              Use your SOURC3 referral link to spread the Web3 word. Your referral score
              {' '}
              <span className={styles.drop}>
                will entitle you to future benefits (and SC3 tokens).
              </span>
            </p>
          </div>
          <div className={styles.button}>
            <NavButton
              name="Copy referral link"
              isDisabled={!id}
              onClick={handleCopyLink}
              classes={styles.buttonItem}
            />
            <NavButton
              name="Your referral statistic"
              onClick={() => navigate('/referral-programm')}
              classes={styles.buttonItem}
            />
            <NavButton
              name="Next"
              classes={styles.next}
              onClick={() => navigate(`/profile/${github_login}`)}
            />
          </div>
          <button
            type="button"
            onClick={() => navigate(`/profile/${github_login}`)}
            className={styles.skip}
          >
            Skip for now

          </button>
        </div>
      </div>
    </div>
  );
}

export default Step3;
