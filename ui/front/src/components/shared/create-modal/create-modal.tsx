import { BeamButton } from '@components/shared';
import { Input, Modal } from 'antd';
import React, { useState } from 'react';

type InputChange = React.ChangeEventHandler<HTMLInputElement>;

type AddModalType = {
  isModalVisible: boolean;
  handleCreate: (name:string) => void;
  handleCancel: () => void;
  placeholder: string;
};

function CreateModal({
  isModalVisible,
  placeholder,
  handleCancel,
  handleCreate
}:AddModalType) {
  const [inputName, setInputName] = useState('');

  const handleChange:InputChange = (e) => setInputName(e.target.value);

  const handleOk = () => handleCreate(inputName);

  return (
    <Modal
      visible={isModalVisible}
      onCancel={handleCancel}
      closable={false}
      footer={[
        <BeamButton key="all-repos-addBtn" callback={handleOk}>
          Add
        </BeamButton>
      ]}
    >
      <Input
        placeholder={placeholder}
        value={inputName}
        onChange={handleChange}
        onPressEnter={handleOk}
      />
    </Modal>
  );
}

export default CreateModal;
