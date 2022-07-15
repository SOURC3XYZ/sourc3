import { NavButton } from '@components/shared';
import { InputCustom } from '@components/shared/input';
import Popup from '@components/shared/popup/popup';
import { Button } from 'antd';
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

  const handleSetPopup = () => setIsPopup(true);

  return (
    <>
      <InputCustom
        autoFocus
        placeholder={placeholder}
        onChange={onInput}
        value={pass}
        type="password"
        password
        onKeyDown={(e) => (e.key === 'Enter' && onSubmit())}
      />
      <Button type="link" className={styles.forgot} onClick={handleSetPopup}>
        Forgot password? Secret phrase restore
      </Button>
      <div className={styles.btnNav}>
        <NavButton
          name="Sign in"
          link="/auth/login"
          onClick={onSubmit}
          active
        />
      </div>
      <Popup
        visible={isPopup}
        title="Restore account or create new one"
        onCancel={onCancel}
        agree
        confirmButton={(
          <NavButton
            name="Proceed"
            link="/auth/start"
            active
          />
        )}
      >
        <span>
          If you forgot your password,
          you still can access your account using your secret phrase,
          but all transaction history and addresses will be lost
        </span>
      </Popup>
    </>
  );
}

export default Password;
