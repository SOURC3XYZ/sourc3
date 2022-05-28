import { useState } from 'react';

type CreateModalCb = (str: string) => void;

type UseCreateModalArgs = [CreateModalCb, CreateModalCb];

const useModal = (...[handleInput, submit]: UseCreateModalArgs) => {
  const [isModal, setIsModal] = useState(false);

  const showModal = () => setIsModal(true);

  const closeModal = () => setIsModal(false);

  const setInputText = (txt: string) => handleInput(txt);

  const handleOk = (name: string) => {
    closeModal();
    submit(name);
  };

  return {
    isModal,
    setInputText,
    showModal,
    closeModal,
    handleOk
  };
};

export default useModal;
