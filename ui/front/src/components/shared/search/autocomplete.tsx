import { LoadingOutlined } from '@ant-design/icons';
import { AutoComplete } from 'antd';
import { useMemo } from 'react';
import { useAutoComplete } from '@libs/hooks/container/search';
import Search from './search';
import styles from './search.module.scss';
import Options from './options';

type SearchProps = {
  placeholder: string;
  className?: string;
};

function AutocompeteSearch({
  placeholder, className = ''
}:SearchProps) {
  const {
    searchText, items, isOnLoad, setInputText
  } = useAutoComplete();

  const options = useMemo(() => (searchText
    ? items : [])
    .map((el) => ({
      value: [el.repo_owner, el.repo_name].join('-'),
      className: styles.option,
      label: <Options repo={el} searchText={searchText} />
    })), [searchText, items]);

  const spinnerClass = isOnLoad
    ? styles.loadingActive
    : styles.loading;

  return (
    <AutoComplete
      className={styles.autocomplete}
      dropdownClassName={styles.dropdown}
      options={options}
    >
      <Search
        text={searchText}
        className={className}
        placeholder={placeholder}
        setInputText={setInputText}
      >
        <LoadingOutlined spin className={spinnerClass} />
      </Search>
    </AutoComplete>
  );
}

export default AutocompeteSearch;
