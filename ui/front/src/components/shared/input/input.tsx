import { IconEyeOpen, IconEyeCrossed } from '@components/svg';
import React, { useRef, useState } from 'react';
import IconSocial from '@components/shared/input/Icon';
import classNames from 'classnames';
import styles from './input.module.scss';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  autoFocus?: boolean,
  label?: string | null;
  valid?: boolean;
  password?: boolean;
  length?: number;
  type?: string,
  err?:string | null;
  icon?: JSX.Element | string;
  refs?: React.InputHTMLAttributes<HTMLInputElement>;

}

const InputCustom = React.forwardRef(({
  label, autoFocus = true, valid = true, icon, password, length, type, err, ...rest
}: InputProps, refs) => {
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
        {label ? <label htmlFor="input" className={valid ? styles.labelUp : styles.labelUpRed}>{label}</label> : null}
        <input
          autoFocus={autoFocus}
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
        {icon && (
          typeof icon === 'object' ? icon
            : <IconSocial icon={icon} className={styles.icon} />
        ) }
        <label htmlFor="input" className={styles.labelDown}>{err}</label>
      </div>
    )
  );
});

export default InputCustom;
