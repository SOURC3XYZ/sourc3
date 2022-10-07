import { IconCloseCross } from '@components/svg';
import styles from './achievements.module.scss';

type AchievementProps = {
  name: string
  isVisible:boolean;
  color: string;
  children: JSX.Element;
  setInvisible: (e?:React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
};

function AchievementPopup({
  isVisible, name, color, children, setInvisible
}: AchievementProps) {
  const className = isVisible ? styles.popupBlockActive : styles.popupBlock;

  return (
    <div
      style={
        { background: `linear-gradient(180deg, ${color} 1.51%, ${color} 1.52%, #FFFFFF 31.07%)` }
      }
      className={className}
    >
      <div style={{ borderBottomColor: color }} className={styles.arrowPart1} />
      <div style={{ borderBottomColor: color }} className={styles.arrowPart2} />
      <a className={styles.closeButton} href="/" onClick={setInvisible}>
        <IconCloseCross />
      </a>
      <div className={styles.upperPart}>
        <h2>{name}</h2>
      </div>
      {children}
    </div>
  );
}

export default AchievementPopup;
