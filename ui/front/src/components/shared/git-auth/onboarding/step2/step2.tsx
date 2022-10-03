
import styles from './step.module.scss';
import React from "react";
import discordIcon from '@assets/icons/discordIcon.svg';
import twitterIcon from '@assets/icons/twitterIcon.svg';
import doneIcon from '@assets/icons/done.svg';
import {NavButton} from "@components/shared";

function Step2() {
  return (
      <div className={styles.section}>
          <div className={styles.step}>
              <div className={styles.dots}>
                  <span className={styles.orange}><img src={doneIcon} alt="doneIcon" /></span>
                  <span className={styles.green}>2</span>
                  <span className={styles.blue}></span>
              </div>
              <div className={styles.content}>
                  <h1>Join the SOURC3 <span className={styles.color}>Discord</span> and <span className={styles.color}>Twitter</span></h1>
                  <div className={styles.text}>
                      <p>Join the conversation with other like minded developers! <span className={styles.drop}>(All announcements for  benefits and drops will be made through our</span> Discord Server.)</p>
                      <p>... and follow SOURC3 on twitter to stay up to date with all the latest Web3 <span className={styles.drop}>news.</span></p>
                  </div>
                  <div className={styles.link}>
                      <a href="https://discord.com/invite/Fw3Wvqt42b">
                          <img src={discordIcon} alt="discordIcon" />
                          Join our Discord
                      </a>
                      <a href="https://twitter.com/SOURC3xyz">
                          <img src={twitterIcon} alt="twitter" />
                          Follow us on Twitter
                      </a>
                      <NavButton
                          name="Next"
                      />
                  </div>
                  <a href="@components/shared/git-auth/onboarding/step2/step2#">Skip for now</a>
              </div>
          </div>
      </div>
  );
}

export default Step2;
