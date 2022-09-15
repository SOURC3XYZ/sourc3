import { NavButton } from '@components/shared';
// import { Radio } from 'antd';
// import { Input, Modal } from 'antd';
import React, { useState } from 'react';
import { InputCustom } from '../input';
import { Popup } from '../popup';
// import styles from './create-modal.module.scss';

type InputChange = React.ChangeEventHandler<HTMLInputElement>;

type AddModalType = {
  isModalVisible: boolean;
  handleCreate: (name:string) => void;
  handleCancel: () => void;
  closePopup?: () => void;
  placeholder: string;
  label: string;
  title: string;
};

function CreateModal({
  isModalVisible,
  placeholder,
  handleCancel,
  handleCreate,
  closePopup,
  label,
  title
}:AddModalType) {
  const [inputName, setInputName] = useState('');
  const [valid, setValid] = useState(true);

  const handleChange:InputChange = (e) => {
    const regExp = /[А-я]+/;
    setInputName(e.target.value);
    setValid(!regExp.test(e.target.value));
  };

  const handleOk = () => {
    handleCreate(inputName);
    setInputName('');
    if (closePopup) closePopup();
  };

  const handleCanceled = () => {
    handleCancel();
    setInputName('');
  };

  return (
    <Popup
      title={title}
      visible={isModalVisible}
      onCancel={handleCanceled}
      confirmButton={(
        <NavButton
          key="all-repos-addBtn"
          onClick={handleOk}
          isDisabled={!inputName || !valid}
          name="Continue"
          active
        />
      )}
      agree
    >
      <InputCustom
        label={label}
        type="text"
        placeholder={placeholder}
        value={inputName}
        onChange={handleChange}
        valid={valid}
      />
    </Popup>
  );
}

export default CreateModal;
