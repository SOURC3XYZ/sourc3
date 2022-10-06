
import styles from './referralProgramm.module.scss'
import {NavButton} from "@components/shared";
import React from "react";

function ReferralProgramm() {
    return (
        <div className={styles.section}>
            <h1>Referral program</h1>
            <div className={styles.content}>
                <div className={styles.text}>
                    <h4>You have 50 referral points</h4>
                    <p>Your referral score will entitle you to future benefits and airdrops. Use your SOURC3 referral link to spread the Web3 word.</p>
                    <NavButton
                        name="Copy referral link"
                    />
                </div>
                <div className={styles.table}>
                    <div className={styles.title}>
                        <h4>Activation date</h4>
                        <h4>Referral points</h4>
                    </div>
                    <div className={styles.date}>
                        {/*<div className={styles.empty}>*/}
                        {/*    <p>No one have used your referral link so far</p>*/}
                        {/*</div>*/}

                        <div className={styles.info}>
                            <p>11 Oct 2022, 4:56 PM</p>
                            <p>10</p>
                        </div>
                        <div className={styles.info}>
                            <p>11 Oct 2022, 4:56 PM</p>
                            <p>10</p>
                        </div>
                        <div className={styles.info}>
                            <p>11 Oct 2022, 4:56 PM</p>
                            <p>10</p>
                        </div>
                        <div className={styles.info}>
                            <p>11 Oct 2022, 4:56 PM</p>
                            <p>10</p>
                        </div>
                        <div className={styles.info}>
                            <p>11 Oct 2022, 4:56 PM</p>
                            <p>10</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default ReferralProgramm;