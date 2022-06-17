import React, { ReactNode, useRef } from 'react';
import styles from './popup.module.scss';

interface BackDropProps {
  onCancel?: React.MouseEventHandler;
  children?: ReactNode;
}

function BackDrop({ onCancel, children }: BackDropProps) {
  const rootRef = useRef();

  const handleOutsideClick = (e: any) => {
    if (e.target === rootRef.current) {
      onCancel(e);
    }
  };

  return (
    <div
      className={styles.backDrop}
      ref={rootRef}
      onClick={handleOutsideClick}
    >
      {children}
    </div>
  );
}

export default BackDrop;
