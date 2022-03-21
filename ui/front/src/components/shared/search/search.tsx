import { Input } from 'antd';
import { ChangeEvent } from 'react';
import styles from './search.module.scss';

type SearchProps = {
  text: string;
  placeholder: string;
  className?: string;
  setInputText: (inputText: string) => void
};

const Search = ({
  text, placeholder, className = '', setInputText
}:SearchProps) => {
  const onSearchChange = (
    e:ChangeEvent<HTMLInputElement>
  ) => setInputText(e.target.value);

  return (
    <Input
      className={[styles.search, className].join(' ')}
      placeholder={placeholder}
      value={text}
      onChange={onSearchChange}
    />
  );
};

export default Search;
