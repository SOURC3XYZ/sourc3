import { AC } from '@libs/action-creators';
import { useDispatch, useSelector } from '@libs/redux';

const useAutoComplete = () => {
  const dispatch = useDispatch();
  const searchText = useSelector((state) => state.entities.searchText);
  const repoList = useSelector((state) => state.entities.repos);
  const isApiConnected = useSelector((state) => state.app.isApiConnected);

  const isOnLoad = !isApiConnected && searchText;

  const setInputText = (inputText: string) => dispatch(AC.setSearch(inputText));

  return {
    repoList,
    isOnLoad,
    searchText,
    setInputText
  };
};

export default useAutoComplete;
