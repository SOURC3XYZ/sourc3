import { ReactComponentElement, useState } from 'react';
import styles from './mane.module.scss';

type ManeProps = {
  first: any
  second: any;
};

function Mane({ first, second }: ManeProps) {
  const [selectedId, setSelectedId] = useState(1);
  const toggleTabs = (idx) => {
    setSelectedId(idx);
  };

  const renderContent = (i) => {
    switch (i) {
      case 1:
        return (
          <div className={styles.wrapperCount}>
            { first }
          </div>
        );
      case 2:
        return (
          <div className={styles.wrapperCount}>
            {second}
          </div>
        );
      default:
        return (
          { second }
        );
    }
  };
  return (
    <>
      <ul className={styles.wrapperMenu}>
        <li className={selectedId === 1 ? styles.active : styles.item} onClick={() => toggleTabs(1)}>
          Achievements
        </li>
        <li className={selectedId === 2 ? styles.active : styles.item} onClick={() => toggleTabs(2)}>
          Repositories
        </li>
      </ul>
      {renderContent(selectedId)}
    </>
  );
}

export default Mane;
