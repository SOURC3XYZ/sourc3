import {
  Input, Modal
} from 'antd';
import { useState } from 'react';

type CreateModalProps = {
  handleOk: () => void;
  handleCancel: () => void;
  createRepo: (repo_name: string) => void
};

const CreateModal = ({
  handleOk,
  handleCancel,
  createRepo
}: CreateModalProps) => {
  const [name, setName] = useState('');

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const onCancel = () => {
    createRepo(name);
    handleCancel();
  };

  return (
    <Modal visible onOk={handleOk} onCancel={onCancel} closable={false}>
      <Input
        placeholder="Enter name repository"
        value={name}
        onChange={onChange}
        onPressEnter={handleOk}
      />
    </Modal>
  );
};

export default CreateModal;
