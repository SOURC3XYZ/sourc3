import { IconEyeOpen, IconEyeCrossed } from '@components/svg';
import { Button } from 'antd';
import React, { useRef, useState } from 'react';
import styles from './input.module.scss';

interface IputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string | null;
  valid?: boolean;
  password?: boolean;
  length?: number;
}

function InputCustom({
  label, valid = true, password, length, ...rest
}: IputProps) {
  const [passwordShown, setPasswordShown] = useState(false);
  const handleShowPassword: React.MouseEventHandler = () => {
    setPasswordShown(!passwordShown);
  };
  const ref = useRef();
  return (
    <div className={styles.wrapper}>
      <input
        className={valid ? styles.input : styles.valid}
        // ref={ref}
        valid={valid}
        {...rest}
        type={passwordShown ? 'text' : 'password'}
      />
      <button
        type="button"
        className={styles.buttonEye}
        onClick={handleShowPassword}
      >
        {!passwordShown
          ? <IconEyeOpen className={styles.eye} />
          : <IconEyeCrossed className={styles.eyeCrossed} />}
      </button>
      {!!ref && <div className={styles.label} valid={valid}>{label}</div>}
    </div>
  );
}

export default InputCustom;
