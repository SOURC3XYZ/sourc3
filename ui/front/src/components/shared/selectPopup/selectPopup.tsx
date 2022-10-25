import { Select } from 'antd';
import { ReactNode } from 'react';
import styles from './selectPopup.module.scss';

  type SelectPopupProps = {
    title:string;
    value: number,
    disabled?:boolean,
    children?: ReactNode,
    defaultValue?:number,
    className?: string,
    onChange: (value: number) => void
  };

function SelectPopup({
  title, value, children, defaultValue, className = '', disabled = false, onChange
}:SelectPopupProps) {
  const selectClassName = [className, styles.select].join(' ');
  return (
    <div className={styles.wrapper}>
      <span className={styles.title}>
        {title}
      </span>
      <div>
        <Select
          bordered
          disabled={disabled}
          className={selectClassName}
          defaultValue={defaultValue}
          size="small"
          value={value}
          onChange={onChange}
          dropdownClassName={styles.dropDown}
        >
          {children}
        </Select>
      </div>
    </div>
  );
}

export default SelectPopup;
