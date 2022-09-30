import React from "react";
import styles from './step.module.scss';
import InputCustom from "../../../input/input";
import {NavButton} from "@components/shared";
import StepHead from "@components/shared/git-auth/onboarding/stepHead/stepHead";

function Step1() {
  return (
    <div className={styles.section}>
        <StepHead />
        <div className={styles.step}>
            <div className={styles.dots}>
                <span className={styles.orange}>1</span>
                <span className={styles.green}></span>
                <span className={styles.blue}></span>
            </div>
            <div className={styles.content}>
                <h4>NEXT STEPS</h4>
                <h2><span className={styles.color}>Future proof</span> your reputation and <span className={styles.drop}>contributions</span> </h2>
                <div className={styles.text}>
                    <p>We want to ensure your reputation and contributions are attributed to you. <span className={styles.drop}>(PLUS we want to be able to airdrop SOURC3 rewards and benefits directly</span> to you.)</p>
                    <p>Pop your Ethereum wallet address (hex or ENS) below:</p>
                </div>
                <div className={styles.input}>
                    <InputCustom />
                    <NavButton
                        name="Next"
                        isDisabled
                    />
                </div>
                <a href="@components/shared/git-auth/onboarding/step1/step1#">Skip for now</a>
            </div>
        </div>
    </div>
  );
}

export default Step1;