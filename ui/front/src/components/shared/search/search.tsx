import { Input } from 'antd';
import {
  ChangeEvent, forwardRef, LegacyRef, ReactNode
} from 'react';
import styles from './search.module.scss';

type SearchProps = {
  text?: string;
  placeholder: string;
  className?: string;
  setInputText?: (inputText: string) => void;
  children?: ReactNode;
};

const Search = forwardRef(({
  text, placeholder, children, className = '', setInputText
}:SearchProps, ref: LegacyRef<Input>) => {
  const onSearchChange = (
    e:ChangeEvent<HTMLInputElement>
  ) => {
    if (setInputText) setInputText(e.target.value);
  };

  return (
    <Input
      ref={ref}
      className={[styles.search, className].join(' ')}
      placeholder={placeholder}
      value={text}
      onChange={onSearchChange}
      prefix={children}
    />
  );
});

export default Search;
