import { useOutsideClick } from '@libs/hooks/shared';
import { useRef, useState } from 'react';
import AchievementPopup from './achievement-popup';
import styles from './achievements.module.scss';

export type AnchorEvent = React.MouseEvent<HTMLAnchorElement, MouseEvent>;

type AchievementProps = {
  item: any;
  color: string;
  img: string;
  children:JSX.Element;
};

function Achievement({
  item, img, color, children
}:AchievementProps) {
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

  const ghostBlockClass = popupVisible ? styles.ghostBlockActive : styles.ghostBlock;

  return (
    <>
      <div className={ghostBlockClass} />
      <div ref={ref} className={styles.achieveItem}>
        <a className={styles.icon} href="/" onClick={setVisible}>
          <img
            alt="prog-lang"
            src={img}
          />
        </a>
        <AchievementPopup
          color={color}
          name={item.title}
          isVisible={popupVisible}
          setInvisible={setInvisible}
        >
          {children}
        </AchievementPopup>
      </div>
    </>
  );
}

export default Achievement;
