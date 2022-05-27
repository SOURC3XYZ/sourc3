import { EyeTwoTone, EyeInvisibleOutlined } from '@ant-design/icons';
import { NavButton } from '@components/shared/nav-button';
import { Input, Space } from 'antd';
import React from 'react';

type PasswordRestoreType = {
  onClick: (base: string, repeat:string) => void
  isCreate?: boolean
};

function PasswordRestore({ onClick, isCreate }: PasswordRestoreType) {
  const [base, setBase] = React.useState('');
  const [repeat, setRepeat] = React.useState('');

  const setInputState = (
    callback: React.Dispatch<React.SetStateAction<string>>
  ) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target) callback(e.target.value);
  };

  const onClickDecor = () => onClick(base, repeat);

  const setVisibleIcon = (visible:boolean) => (
    visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />);

  return (
    <Space direction="vertical">
      <p>Create password to access your account</p>
      <Input.Password
        onChange={setInputState(setBase)}
        value={base}
        placeholder="input password"
        iconRender={setVisibleIcon}
      />
      <Input.Password
        onChange={setInputState(setRepeat)}
        value={repeat}
        placeholder="repeat password"
        iconRender={setVisibleIcon}
      />
      <NavButton
        name={isCreate ? 'Create' : 'Restore'}
        onClick={onClickDecor}
      />
    </Space>
  );
}
export default PasswordRestore;
