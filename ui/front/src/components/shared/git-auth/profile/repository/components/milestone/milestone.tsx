import React from 'react';
import styles from './milestone.module.scss';

type mileStoneProps = {
  title: string,
  tooltip: string
};

function Milestone({ title, tooltip }:mileStoneProps) {
  return (
    <div className={styles.wrapper}>
      <span className={styles.title} title={tooltip}>{title}</span>
    </div>
  );
}

export default Milestone;
