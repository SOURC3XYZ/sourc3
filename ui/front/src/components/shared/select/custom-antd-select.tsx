import { Select } from 'antd';
import { ReactNode } from 'react';
import styles from './custom-antd-select.module.scss';

  type CustomSelectProps = {
    title:string;
    value: string,
    children?: ReactNode,
    defaultValue?:string,
    className?: string,
    onChange: (branch: string) => void
  };

function CustomAntdSelect({
  title, value, children, defaultValue, className = '', onChange
}:CustomSelectProps) {
  const selectClassName = [className, styles.select].join(' ');
  return (
    <div className={styles.wrapper}>
      <span className={styles.title}>
        {title}
      </span>
      <div>
        <Select
          bordered
          className={selectClassName}
          defaultValue={defaultValue}
          size="small"
          value={value}
          onChange={onChange}
        >
          {children}
        </Select>
      </div>
    </div>
  );
}

export default CustomAntdSelect;
