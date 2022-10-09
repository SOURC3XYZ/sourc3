import { copyRefLink, NavButton } from '@components/shared';
import { useNavigate } from 'react-router-dom';
import { useSelector } from '@libs/redux';
import { LOCAL_STORAGE_ITEMS } from '@libs/constants';
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
              You have friends who will benefit from building the Web3 way, plus sharing
              {' '}
              <span className={styles.drop}>is caring! </span>
            </p>
            <p>
              Use your referral link to spread the word of SOURC3. Your referral score will
              {' '}
              <span className={styles.drop}>
                entitle you to future benefits and airdrops.
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
              onClick={() => {
                navigate(`/profile/${github_login}`);
                localStorage.removeItem(LOCAL_STORAGE_ITEMS.ONBOARDING_STEP);
              }}
            />
          </div>
          <button
            type="button"
            onClick={() => {
              navigate(`/profile/${github_login}`);
              localStorage.removeItem(LOCAL_STORAGE_ITEMS.ONBOARDING_STEP);
            }}
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
