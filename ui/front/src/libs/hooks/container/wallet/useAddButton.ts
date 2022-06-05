import { MODAL } from '@libs/constants';
import { useObjectState } from '@libs/hooks/shared';
import { useWalletAction } from '@libs/hooks/thunk';

const initialState = {
  isLoading: true,
  modal: MODAL.NONE
};

export const useAddButton = () => {
  const { cloneRepo } = useWalletAction();

  const [state, setState] = useObjectState(initialState);
  const { modal } = state;

  const showModal = (mode: MODAL) => setState({ modal: mode });

  const handleCancel = () => setState({ modal: MODAL.NONE });

  const handleOk = () => setState({ modal: MODAL.NONE });

  return {
    modal,
    showModal,
    handleCancel,
    handleOk,
    cloneRepo
  };
};

// createRepo: (repo_name:string) => {
//     if (repo_name === null) return;
//     dispatch(thunks.createRepos(repo_name));
//   },

//   cloneRepo: (local:string, remote: string) => {
//     dispatch(thunks.cloneRepo(local, remote));
//   }
