import { useObjectState } from '@libs/hooks/shared';
import { PromiseArg } from '@types';
import { ChangeEvent } from 'react';

type UseHeaderProps = {
  pkey:string;
  isOnLending: boolean;
  connectToExtention: (resolve: PromiseArg<void>, reject?: PromiseArg<Error>) => void;
  createRepos: (repo_name:string) => void;
};

const initialState = {
  isLoading: true,
  isModalVisible: false,
  inputRepoName: ''
};

const useHeader = ({
  pkey,
  connectToExtention,
  createRepos
}:UseHeaderProps) => {
  const isPkey = Boolean(pkey);

  const [state, setState] = useObjectState<typeof initialState>(initialState);
  const { isModalVisible, inputRepoName } = state;

  const onConnect = connectToExtention;

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
    onConnect,
    showModal,
    handleOk,
    handleCancel,
    handleChange
  };
};

export default useHeader;
