import { Input } from 'antd';
import React from 'react';

type SearchProps = {

  text: string
  setInputText: (inputText: string) => void
};

const Search = ({ text, setInputText }:SearchProps) => {
  const searchRef = React.useRef<Input>(null);

  const onSearchChange = (
    e:React.ChangeEvent<HTMLInputElement>
  ) => { setInputText(e.target.value); };

  React.useEffect(() => {
    searchRef.current?.focus({
      cursor: 'end'
    });
  });

  return (
    <Input
      placeholder="enter repo name"
      value={text}
      onChange={onSearchChange}
    />
  );
};

export default Search;
