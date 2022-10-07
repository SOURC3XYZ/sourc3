import React from 'react';
import styles from './milestone.module.scss';

type mileStoneProps = {
  title: string,
  tooltip?: string
  summary?: boolean,
  tags?: boolean
  procent?: number
};

function Milestone({
  title, tooltip, summary, tags, procent
}:mileStoneProps) {
  const classNames = summary ? styles.summary : tags ? styles.tags : styles.wrapper;
  return (
    <div className={classNames}>
      <span className={styles.title} title={tooltip}>
        {title}
        {procent && (
          <span className={styles.procent}>
            {`(${procent}%)`}
          </span>
        )}
      </span>
    </div>
  );
}

export default Milestone;
