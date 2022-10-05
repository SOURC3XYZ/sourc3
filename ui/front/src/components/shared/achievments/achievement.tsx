import { useOutsideClick } from '@libs/hooks/shared';
import { useRef, useState } from 'react';
import AchievementPopup, { AchievementParams } from './achievement-popup';
import styles from './achievements.module.scss';

export type AnchorEvent = React.MouseEvent<HTMLAnchorElement, MouseEvent>;

type AchievementProps = {
  params: AchievementParams;
  color: string;
  img: string;
};

function Achievment({ params, img, color }:AchievementProps) {
  const [popupVisible, setPopupVisible] = useState(false);

  const ref = useRef<HTMLDivElement>(null);

  const setVisible = (e:AnchorEvent) => {
    e.preventDefault();
    setPopupVisible(true);
  };

  const setInvisible = (e?:AnchorEvent) => {
    if (e) e.preventDefault();
    setPopupVisible(false);
  };

  useOutsideClick(ref, () => setInvisible());

  return (
    <div ref={ref} className={styles.achieveItem}>
      <a className={styles.icon} href="/" onClick={setVisible}>
        <img
          alt="prog-lang"
          src={img}
        />
      </a>
      <AchievementPopup
        color={color}
        params={params}
        isVisible={popupVisible}
        setInvisible={setInvisible}
      />
    </div>
  );
}

export default Achievment;
