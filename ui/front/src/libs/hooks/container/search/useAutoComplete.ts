import { AC } from '@libs/action-creators';
import { useSearch } from '@libs/hooks/shared/useSearch';
import { useDispatch, useSelector } from '@libs/redux';

const useAutoComplete = () => {
  const dispatch = useDispatch();
  const searchText = useSelector((state) => state.entities.searchText);
  const repoList = useSelector((state) => state.entities.repos);
  const isApiConnected = useSelector((state) => state.app.isApiConnected);

  const isOnLoad = !isApiConnected && searchText;

  const setInputText = (inputText: string) => dispatch(AC.setSearch(inputText));

  const items = useSearch(searchText, repoList, ['repo_id', 'repo_name']);

  return {
    items,
    isOnLoad,
    searchText,
    setInputText
  };
};

export default useAutoComplete;
