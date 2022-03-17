import { Input } from 'antd';
import { ChangeEvent, useEffect, useRef } from 'react';

type SearchProps = {
  text: string;
  placeholder: string;
  setInputText: (inputText: string) => void
};

const Search = ({ text, placeholder, setInputText }:SearchProps) => {
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
      placeholder={placeholder}
      value={text}
      onChange={onSearchChange}
    />
  );
};

export default Search;
