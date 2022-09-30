
import styles from './stepHead.module.scss';
import early from '@assets/icons/early-adopter.svg';
import arrow from '@assets/icons/arrow2.svg';
import ellipse from '@assets/icons/ellipse.svg';

function StepHead() {
  return (
    <div className={styles.section}>
        <div className={styles.title}>
            <div className={styles.img}>
                <img className={styles.arrow} src={arrow} alt=""/>
                <img className={styles.ellipse} src={ellipse} alt=""/>
            </div>
            <h1><span className={styles.indent}>BIGROMANOV, thank you</span>
                <span className={styles.drop}>for joining <a href="@components/shared/git-auth/onboarding/stepHead/stepHead#">SOURC3</a> and</span>
                the community shaping <span className={styles.green}>the new web!</span></h1>
            <img src={early} alt="early adopter"/>
        </div>
        <div className={styles.count}>
            <h4>You are creator</h4>
            <div className={styles.countNum}><h4>#567</h4></div>
        </div>
        <div className={styles.text}>
            <p>SOURC3 has a community of <span>7777</span> of creators who are building their reputation by bringing their contributions on-chain.</p>
            <p>As an early adopter and on-chain contributor, you will receive benefits including exclusive airdrops, and early access to new features and products.</p>
        </div>
    </div>
  );
}

export default StepHead;
