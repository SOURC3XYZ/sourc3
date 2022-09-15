import { IconEyeOpen, IconEyeCrossed } from '@components/svg';
import React, { useRef, useState } from 'react';
import styles from './input.module.scss';

interface IputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string | null;
  valid?: boolean;
  password?: boolean;
  length?: number;
  type?: string
}

function InputCustom({
  label, valid = true, password, length, type, ...rest
}: IputProps) {
  const [passwordShown, setPasswordShown] = useState(false);
  const handleShowPassword: React.MouseEventHandler = () => {
    setPasswordShown(!passwordShown);
  };
  const ref = useRef<HTMLInputElement>(null);
  return (
    password ? (
      <div className={styles.wrapper}>
        <input
          className={valid ? styles.input : styles.valid}
          ref={ref}
          // valid={valid}
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

        {!!ref && (
          <div
            className={styles.label}
            // valid={valid}
          >
            {label}
          </div>
        )}
      </div>
    ) : (
      <div className={styles.wrapperInput}>
        <label htmlFor="input" className={styles.labelUp}>{label}</label>
        <input
          autoFocus
          id="input"
          className={valid ? styles.inputText : styles.invalid}
          // ref={ref}
          {...rest}
          type="text"
        />
      </div>
    )
  );
}

export default InputCustom;
