
import styles from './step.module.scss';
import doneIcon from "@assets/icons/done.svg";
import {NavButton} from "@components/shared";
import React from "react";

function Step3() {
  return (
      <div className={styles.section}>
          <div className={styles.step}>
              <div className={styles.dots}>
                  <span className={styles.orange}><img src={doneIcon} alt="doneIcon" /></span>
                  <span className={styles.green}><img src={doneIcon} alt="doneIcon" /></span>
                  <span className={styles.blue}>3</span>
              </div>
              <div className={styles.content}>
                  <h1>Help others to bring their <span className={styles.drop}>contributions <span className={styles.color}>on-chain</span></span></h1>
                  <div className={styles.text}>
                      <p>We’re sure you have friends and contacts who will benefit from <span className={styles.drop}>building the Web3 way? </span></p>
                      <p>Use your SOURC3 referral link to spread the Web3 word. Your referral score <span className={styles.drop}>will entitle you to future benefits (and SC3 tokens).</span></p>
                  </div>
                  <div className={styles.button}>
                      <NavButton
                          name="Copy referral link"
                          classes={styles.buttonItem}
                      />
                      <NavButton
                          name="Your referral statistic"
                          classes={styles.buttonItem}
                      />
                      <NavButton
                          name="Next"
                          classes={styles.next}
                      />
                  </div>
                  <a href="@components/shared/git-auth/onboarding/step2/step2#">Skip for now</a>
              </div>
          </div>
      </div>
  );
}

export default Step3;
