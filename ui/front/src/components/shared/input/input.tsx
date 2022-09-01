import { IconEyeOpen, IconEyeCrossed } from '@components/svg';
import React, { useRef, useState } from 'react';
import IconSocial from '@components/shared/input/Icon';
import classNames from 'classnames';
import styles from './input.module.scss';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string | null;
  valid?: boolean;
  password?: boolean;
  length?: number;
  type?: string;
  refs?: React.InputHTMLAttributes<HTMLInputElement>;
  placeholder?: string;
  icon?: string
}

const InputCustom = React.forwardRef(({
  label, valid = true, password, length, type, icon, ...rest
}:InputProps, refs) => {
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
        <label htmlFor="input" className={valid ? styles.labelUp : styles.labelUpRed}>
          {label}
          <input
            autoFocus
            id="input"
            className={
              classNames(
                { [`${styles.inputText}`]: valid },
                { [`${styles.invalid}`]: !valid },
                { [`${styles.iconsMargin}`]: icon }
              )
            }
            ref={refs}
            {...rest}
            type="text"
          />
          {icon && <IconSocial icon={icon} className={styles.icon} /> }
        </label>
      </div>
    )
  );
});

export default InputCustom;
