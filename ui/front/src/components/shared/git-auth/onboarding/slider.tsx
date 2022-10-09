import { Carousel, CarouselProps } from 'antd';
import {
  useCallback, useEffect, useMemo, useRef, useState
} from 'react';
import { CarouselRef } from 'antd/lib/carousel';
import doneIcon from '@assets/icons/done.svg';
import { useParams } from 'react-router-dom';
import { getQueryParam } from '@libs/utils';
import { LOCAL_STORAGE_ITEMS } from '@libs/constants';
import StepStart from './stepStart/stepStart';
import styles from './onbordingStep.module.scss';
import Step1 from './step1/step1';
import Step2 from './step2/step2';
import Step3 from './step3/step3';
import './slider.scss';

function App() {
  useParams();
  const sliderRef = useRef<CarouselRef>(null);
  const initialSlide = getQueryParam(window.location.href, LOCAL_STORAGE_ITEMS.ONBOARDING_STEP);

  const settings:CarouselProps = {
    dotPosition: 'left',
    adaptiveHeight: true,
    infinite: true,
    dots: false,
    vertical: true,
    verticalSwiping: true,
    initialSlide: initialSlide === null ? 0 : +initialSlide,
    beforeChange: () => {
      window.scrollTo({ top: 0 });
    },
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          vertical: false,
          verticalSwiping: false
        }
      }
    ]
  };

  const [isOnboarding, setIsOnboarding] = useState(!!initialSlide);

  const next = useCallback(() => {
    if (sliderRef.current) {
      return sliderRef.current.next();
    } return null;
  }, [sliderRef.current?.next]);

  const mouseWheelEventListener = useCallback((event:any) => {
    if (window.innerWidth <= 1024) return null;
    if (!sliderRef.current) return null;
    if (event.wheelDelta >= 0) return sliderRef.current.prev();
    return sliderRef.current.next();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    document.addEventListener('mousewheel', mouseWheelEventListener);
    return () => { document.removeEventListener('mousewheel', mouseWheelEventListener); };
  }, [isOnboarding]);

  const slides = useMemo(() => [
    <div className={styles.container} key={1}>
      <div className={`${styles.stepWrapper} ${styles.stepWrapper1}`}>
        <div className={styles.step}>
          <div className={styles.dots}>
            <span className={styles.orange}>1</span>
            <span className={styles.green} />
            <span className={styles.blue} />
          </div>
        </div>
        <Step1 callback={next} />
      </div>
    </div>,
    <div className={styles.container} key={2}>
      <div className={`${styles.stepWrapper} ${styles.stepWrapper2}`}>
        <div className={`${styles.step} ${styles.step2}`}>
          <div className={styles.dots}>
            <span className={styles.orange2}><img src={doneIcon} alt="doneIcon" /></span>
            <span className={styles.green2}>2</span>
            <span className={styles.blue2} />
          </div>
        </div>
        <Step2 callback={next} />
      </div>

    </div>,
    <div className={styles.container} key={3}>
      <div className={`${styles.stepWrapper} ${styles.stepWrapper3}`}>
        <div className={`${styles.step} ${styles.step3}`}>
          <div className={styles.dots}>
            <span className={styles.orange3}><img src={doneIcon} alt="doneIcon" /></span>
            <span className={styles.green3}><img src={doneIcon} alt="doneIcon" /></span>
            <span className={styles.blue3}>3</span>
          </div>
        </div>
        <Step3 />
      </div>
    </div>
  ], [next]);

  if (isOnboarding || initialSlide !== null) {
    return (
      <Carousel ref={sliderRef} {...settings}>
        {slides}
      </Carousel>
    );
  }

  return (
    <div>
      <StepStart callback={() => setIsOnboarding(true)} />
    </div>
  );
}

export default App;
