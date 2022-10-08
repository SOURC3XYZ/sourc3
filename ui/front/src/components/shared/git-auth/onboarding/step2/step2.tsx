import discordIcon from '@assets/icons/discordIcon.svg';
import twitterIcon from '@assets/icons/twitterIcon.svg';
import { NavButton } from '@components/shared';
import styles from './step.module.scss';

type Step2Props = {
  callback: () => void;
};

function Step2({ callback }: Step2Props) {
  return (
    <div className={styles.section}>
      <div className={styles.step}>
        <div className={styles.content}>
          <h1>
            Join the SOURC3
            {' '}
            <span className={styles.color}>Discord</span>
            {' '}
            and
            {' '}
            <span className={styles.color}>Twitter</span>
          </h1>
          <div className={styles.text}>
            <p>
              Join the conversation with other like minded developers!
              {' '}
              <span className={styles.drop}>
                (All announcements for  benefits and drops will be made through our

              </span>
              {' '}
              Discord Server.)
            </p>
            <p>
              ... and follow SOURC3 on twitter to stay up to date with all the latest Web3
              {' '}
              <span className={styles.drop}>news.</span>
            </p>
          </div>
          <div className={styles.link}>
            <a href="https://discord.com/invite/Fw3Wvqt42b" target="_blank" rel="noreferrer">
              <img src={discordIcon} alt="discordIcon" />
              Join our Discord
            </a>
            <a href="https://twitter.com/SOURC3xyz" target="_blank" rel="noreferrer">
              <img src={twitterIcon} alt="twitter" />
              Follow us on Twitter
            </a>
            <NavButton
              name="Next"
              onClick={callback}
            />
          </div>
          <button
            type="button"
            onClick={callback}
            className={styles.skip}
          >
            Skip for now

          </button>
        </div>
      </div>
    </div>
  );
}

export default Step2;
