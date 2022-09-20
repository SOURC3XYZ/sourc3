import React from 'react';
import styles from './milestone.module.scss';

type mileStoneProps = {
  title: string
};

function Milestone({ title }:mileStoneProps) {
  return (
    <div className={styles.wrapper}>
      <span className={styles.title}>{title}</span>
    </div>
  );
}

export default Milestone;
