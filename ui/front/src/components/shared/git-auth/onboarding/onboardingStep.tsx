import Step2 from '@components/shared/git-auth/onboarding/step2/step2';
import Step3 from '@components/shared/git-auth/onboarding/step3/step3';
import Step1 from '@components/shared/git-auth/onboarding/step1/step1';
import StepStart from '@components/shared/git-auth/onboarding/stepStart/stepStart';

import {
  useEffect, useMemo, useRef, useState
} from 'react';
import doneIcon from '@assets/icons/done.svg';
import styles from './onbordingStep.module.scss';

function OnboardingStep() {
  const [active, setActive] = useState(1);
  const [goDown, setGoDown] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const setView = () => setGoDown(true);

  const handleActive = () => {
    setActive((prev) => prev + 1);
    setGoDown(false);
  };

  useEffect(() => {
    if (ref.current && goDown) {
      ref.current.addEventListener('animationend', handleActive);
    } return () => {
      if (ref.current) ref.current.removeEventListener('animationend', handleActive);
    };
  }, [goDown]);

  useEffect(() => {
    if (active > 1) {
      document.body.style.overflowY = 'hidden';
      return () => { document.body.style.overflowY = ''; };
    } return undefined;
  }, [active]);

  const currentStep = useMemo(() => {
    const animationClass = goDown ? styles.goDown : styles.fromUp;
    switch (active) {
      case 1:
        return (
          <div ref={ref} key={0} className={goDown ? styles.goDown : ''}>
            <StepStart callback={setView} />
          </div>
        );
      case 2:
        return (
          <div ref={ref} key={1} className={animationClass}>
            <div className={styles.step}>
              <div className={styles.dots}>
                <span className={styles.orange}>1</span>
                <span className={styles.green} />
                <span className={styles.blue} />
              </div>
            </div>
            <Step1 callback={setView} />
          </div>
        );
      case 3:
        return (
          <div ref={ref} key={2} className={animationClass}>
            <div className={`${styles.step} ${styles.step2}`}>
              <div className={styles.dots}>
                <span className={styles.orange2}><img src={doneIcon} alt="doneIcon" /></span>
                <span className={styles.green2}>2</span>
                <span className={styles.blue2} />
              </div>
            </div>
            <Step2 callback={setView} />
          </div>
        );
      default:
        return (
          <div ref={ref} key={3} className={animationClass}>
            <div className={`${styles.step} ${styles.step3}`}>
              <div className={styles.dots}>
                <span className={styles.orange3}><img src={doneIcon} alt="doneIcon" /></span>
                <span className={styles.green3}><img src={doneIcon} alt="doneIcon" /></span>
                <span className={styles.blue3}>3</span>
              </div>
            </div>
            <Step3 />
          </div>
        );
    }
  }, [active, goDown]);

  return (
    <div className={styles.section}>
      {currentStep}
    </div>
  );
}

export default OnboardingStep;
