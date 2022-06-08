import { NavButton } from '@components/shared';
import Popup from '@components/shared/popup/popup';
import { Button, Input } from 'antd';
import { useState } from 'react';
import styles from '../login.module.scss';

type PasswordProps = {
  pass: string,
  onInput: (e: React.ChangeEvent<HTMLInputElement>) => void,
  onSubmit: () => void
};

const placeholder = 'Enter your password';

function Password({ pass, onInput, onSubmit }:PasswordProps) {
  const [isPopup, setIsPopup] = useState(false);
  const onCancel = () => {
    setIsPopup(false);
  };

  return (
    <>
      <label htmlFor="password">
        <Input.Password
          className={styles.password}
          placeholder={placeholder}
          onChange={onInput}
          value={pass}
          type="password"
        />
      </label>

      <Button type="link" className={styles.forgot} onClick={() => (setIsPopup(true))}>
        Forgot password?
      </Button>

      <div className={styles.btnNav}>
        <NavButton
          name="Sign in"
          link="/auth/login"
          onClick={onSubmit}
        />
        <NavButton
          name="Back"
          link="/auth/"
        />
      </div>
      <Popup
        visible={isPopup}
        title="Restore wallet or create new one"
        onCancel={onCancel}
        agree
        confirmButton={(
          <NavButton
            name="Proceed"
            link="/auth/start"
            inlineStyles={{ width: '278px' }}
          />
        )}
      >
        <span>
          If you forgot your password,
          you still can access your wallet using your secret phrase,
          but all transaction history and addresses will be lost
        </span>
      </Popup>
    </>
  );
}

export default Password;
