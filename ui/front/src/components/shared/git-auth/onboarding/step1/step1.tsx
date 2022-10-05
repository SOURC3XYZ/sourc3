import React from "react";
import styles from './step.module.scss';
import InputCustom from "../../../input/input";
import {NavButton} from "@components/shared";


function Step1(props: any) {

  return (
    <div className={styles.section}>
        <div className={styles.step}>
            <div className={styles.content}>
                <h4>NEXT STEPS</h4>
                <h2><span className={styles.color}>Future proof</span> your reputation and <span className={styles.drop}>bring it on-chain</span> </h2>
                <div className={styles.text}>
                    <p>Ensure your reputation and contributions are attributed to you by <span className={styles.drop}>bringing them on-chain and associated to your wallet.</span></p>
                    <p>Connecting your wallet address also means we can airdrop SOURC3 rewards <span className={styles.drop}>and benefits directly.</span> </p>
                    <p>Pop your Ethereum wallet address (hex or ENS) below:</p>
                </div>
                <div className={styles.input}>
                    <InputCustom />
                    <NavButton
                        name="Next"
                        onClick={() => props.onClickHandler(3)}
                    />
                </div>
                <button onClick={() => props.onClickHandler(3)}className={styles.skip}>Skip for now</button>
            </div>
        </div>
    </div>
  );
}

export default Step1;