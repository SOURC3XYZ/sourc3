
import styles from './step.module.scss';
import React from "react";
import discordIcon from '@assets/icons/discordIcon.svg';
import twitterIcon from '@assets/icons/twitterIcon.svg';
import doneIcon from '@assets/icons/done.svg';
import {NavButton} from "@components/shared";

function Step2(props: any) {
  return (
      <div className={styles.section}>
          <div className={styles.step}>
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
                          onClick={() => props.onClickHandler(4)}
                      />
                  </div>
                  <button onClick={() => props.onClickHandler(4)} className={styles.skip}>Skip for now</button>
              </div>
          </div>
      </div>
  );
}

export default Step2;
