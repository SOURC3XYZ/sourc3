import { IconCloseCross } from '@components/svg';
import styles from './achievements.module.scss';

export type AchievementParams = {
  name:string;
  commits:number;
  lines:number;
  hours:number;
  releases:number;
  pullRequests:number;
};

type AchievementProps = {
  params: AchievementParams;
  isVisible:boolean;
  color: string;
  setInvisible: (e?:React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
};

function AchievementPopup({
  isVisible, params, color, setInvisible
}: AchievementProps) {
  const className = isVisible ? styles.popupBlockActive : styles.popupBlock;

  const {
    name, commits, lines, hours, releases, pullRequests
  } = params;

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

        <div>
          <span>
            {commits}
            %
            {' '}
          </span>
          of commits
        </div>
        <div>
          <span>
            {lines}
            {' '}
          </span>
          of lines written
        </div>
      </div>
      <div>
        <span>
          {hours}
          {' '}
          hours
          {' '}
        </span>
        spent coding
      </div>
      <div>
        <span>
          {releases}
          {' '}
        </span>
        releases
      </div>
      <div>
        <span>{pullRequests}</span>
        {' '}
        pull requests
      </div>
    </div>
  );
}

export default AchievementPopup;
