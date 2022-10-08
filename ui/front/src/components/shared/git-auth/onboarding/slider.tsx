import { Carousel, CarouselProps } from 'antd';
import {
  useCallback, useEffect, useMemo, useRef, useState
} from 'react';
import { CarouselRef } from 'antd/lib/carousel';
import doneIcon from '@assets/icons/done.svg';
import { getQueryParam } from '@libs/utils';
import { useParams } from 'react-router-dom';
import StepStart from './stepStart/stepStart';
import styles from './onbordingStep.module.scss';
import Step1 from './step1/step1';
import Step2 from './step2/step2';
import Step3 from './step3/step3';
import './slider.css';

function OnbordingSlider() {
  useParams();

  const initialSlide = getQueryParam(window.location.href, 'initial_slide');

  const sliderRef = useRef<CarouselRef>(null);
  const settings:CarouselProps = {
    dotPosition: 'left',
    adaptiveHeight: true,
    dots: false,
    infinite: false,
    vertical: true,
    verticalSwiping: true,
    swipeToSlide: true,
    initialSlide: initialSlide === null ? 0 : +initialSlide,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    afterChange: (current) => localStorage.setItem('onbording_step', String(current))
  };
  const [isOnboarding, setIsOnboarding] = useState(!!initialSlide);

  const next = useCallback(() => {
    if (sliderRef.current) {
      return sliderRef.current.next();
    } return null;
  }, [sliderRef.current]);

  const slides = useMemo(() => [
    <div className={styles.container} key={1}>
      <div className={styles.stepWrapper}>
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
      <div className={styles.stepWrapper}>
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
      <div className={styles.stepWrapper}>
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

  const mouseWheelEventListener = useCallback((event:any) => {
    if (!sliderRef.current) return;
    if (event.wheelDelta >= 0) {
      sliderRef.current.prev();
    } else {
      sliderRef.current.next();
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousewheel', mouseWheelEventListener);
    return () => { document.removeEventListener('mousewheel', mouseWheelEventListener); };
  }, []);

  if (isOnboarding || initialSlide !== null) {
    return (
      <Carousel className={styles.carousel} ref={sliderRef} {...settings}>
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

export default OnbordingSlider;
