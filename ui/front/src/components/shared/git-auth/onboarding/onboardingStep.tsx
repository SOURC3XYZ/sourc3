import Step2 from '@components/shared/git-auth/onboarding/step2/step2';
import Step3 from '@components/shared/git-auth/onboarding/step3/step3';
import Step1 from '@components/shared/git-auth/onboarding/step1/step1';
import StepStart from '@components/shared/git-auth/onboarding/stepStart/stepStart';

import React from 'react';
import doneIcon from '@assets/icons/done.svg';
import styles from './onbordingStep.module.scss';

function OnboardingStep() {
  const [active, setActive] = React.useState(1);
  const SetView = (active: React.SetStateAction<number>) => {
    setActive(active);
  };

  function ActiveView() {
    switch (active) {
      case 1:
        return <StepStart onClickHandler={SetView} />;
      case 2:
        return (
          <>
            <div className={styles.step}>
              <div className={styles.dots}>
                <span className={styles.orange}>1</span>
                <span className={styles.green} />
                <span className={styles.blue} />
              </div>
            </div>
            <Step1 onClickHandler={SetView} />
          </>
        );
      case 3:
        return (
          <>
            <div className={`${styles.step} ${styles.step2}`}>
              <div className={styles.dots}>
                <span className={styles.orange2}><img src={doneIcon} alt="doneIcon" /></span>
                <span className={styles.green2}>2</span>
                <span className={styles.blue2} />
              </div>
            </div>
            <Step2 onClickHandler={SetView} />
          </>
        );
      default:
        return (
          <>
            <div className={`${styles.step} ${styles.step3}`}>
              <div className={styles.dots}>
                <span className={styles.orange3}><img src={doneIcon} alt="doneIcon" /></span>
                <span className={styles.green3}><img src={doneIcon} alt="doneIcon" /></span>
                <span className={styles.blue3}>3</span>
              </div>
            </div>
            <Step3 onClickHandler={SetView} />
          </>
        );
    }
  }

  return (
    <div className={styles.section}>
      {ActiveView()}
    </div>
  );
}

export default OnboardingStep;
