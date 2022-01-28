import { Button } from 'antd';
import React from 'react';
import style from './beam-btn.module.css';

type BeamButtonProps = {
  callback: () => void;
  title: string;
};

const BeamButton = ({ title, callback }:BeamButtonProps) => {
  const ref = React.useRef <HTMLElement | null>(null);
  const focusHandler = React.useCallback((e: Event) => {
    e.preventDefault();
    return false;
  }, []);
  React.useEffect(() => {
    ref.current?.addEventListener('focus', focusHandler);
    return () => {
      ref.current?.removeEventListener('focus', focusHandler);
    };
  }, []);
  return (
    <div className={style.beamButton}>
      <Button
        ref={ref}
        type="default"
        onClick={() => {
          callback();
          return false;
        }}
      >
        {title}

      </Button>
    </div>
  );
};
export default BeamButton;
