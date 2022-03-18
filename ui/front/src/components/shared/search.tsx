import { Input } from 'antd';
import { ChangeEvent, useEffect, useRef } from 'react';

type SearchProps = {
  text: string;
  placeholder: string;
  setInputText: (inputText: string) => void
};

const Search = ({ text, placeholder, setInputText }:SearchProps) => {
  const style = {
    background: 'rgba(255, 255, 255, 0.1)',
    opacity: 0.5,
    border: '1px solid #FFFFFF',
    borderRadius: 8
  };
  const searchRef = useRef<Input>(null);

  const onSearchChange = (
    e:ChangeEvent<HTMLInputElement>
  ) => setInputText(e.target.value);

  useEffect(() => {
    searchRef.current?.focus({
      cursor: 'end'
    });
  });

  return (
    <Input
      style={style}
      placeholder={placeholder}
      value={text}
      onChange={onSearchChange}
    />
  );
};

export default Search;
