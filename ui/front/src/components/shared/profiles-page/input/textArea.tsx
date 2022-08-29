import React from 'react';
import styles from './textarea.module.scss';

interface TextAreaProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string | null;
  valid?: boolean;
  password?: boolean;
  length?: number;
  type?: string
  refs?: React.InputHTMLAttributes<HTMLInputElement>
}
const TextArea = React.forwardRef(({
  label, valid = true, password, length, type, ...rest
}:TextAreaProps, refs) => (
  <div className={styles.wrapperInput}>
    <label htmlFor="input" className={styles.labelUp}>{label}</label>
    <textarea id="input" className={styles.textarea} ref={refs} {...rest} />
  </div>
));

export default TextArea;
