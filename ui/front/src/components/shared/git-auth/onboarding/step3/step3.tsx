
import styles from './step.module.scss';
import doneIcon from "@assets/icons/done.svg";
import {NavButton} from "@components/shared";
import React from "react";

function Step3(props: any) {
  return (
      <div className={styles.section}>
          <div className={styles.step}>
              <div className={styles.content}>
                  <h1>Help others to bring their <span className={styles.drop}>reputation <span className={styles.color}>on-chain</span></span></h1>
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
                          onClick={() => props.onClickHandler(1)}
                      />
                  </div>
                  <button onClick={() => props.onClickHandler(1)} className={styles.skip}>Skip for now</button>
              </div>
          </div>
      </div>
  );
}

export default Step3;
