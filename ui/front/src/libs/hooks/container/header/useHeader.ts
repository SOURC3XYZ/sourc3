import { useObjectState } from '@libs/hooks/shared';
import { ChangeEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

type UseHeaderProps = {
  pkey:string;
  searchText:string;
  isOnLending: boolean;
  setInputText: (inputText: string) => void;
  connectToExtention: () => void;
  createRepos: (repo_name:string) => void;
};

const initialState = {
  isLoading: true,
  isModalVisible: false,
  inputRepoName: ''
};

const useHeader = ({
  pkey,
  searchText,
  isOnLending,
  setInputText,
  connectToExtention,
  createRepos
}:UseHeaderProps) => {
  const isPkey = Boolean(pkey);
  const setInputTextWrap = (text: string) => setInputText(text);

  const navigate = useNavigate();

  const [state, setState] = useObjectState<typeof initialState>(initialState);
  const { isModalVisible, inputRepoName } = state;

  useEffect(() => {
    if (searchText.length && isOnLending) {
      navigate('repos/all/1');
    }
  }, [searchText]);

  const onConnect = () => connectToExtention();

  const showModal = () => setState({ isModalVisible: true });

  const handleCancel = () => setState({ isModalVisible: false });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => setState({ inputRepoName: e.target.value });

  const handleOk = () => {
    setState({ isModalVisible: false });
    createRepos(inputRepoName);
  };

  return {
    isPkey,
    isModalVisible,
    inputRepoName,
    setInputTextWrap,
    onConnect,
    showModal,
    handleOk,
    handleCancel,
    handleChange
  };
};

export default useHeader;
