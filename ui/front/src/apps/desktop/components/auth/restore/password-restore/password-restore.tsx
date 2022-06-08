import { EyeTwoTone, EyeInvisibleOutlined } from '@ant-design/icons';
import { NavButton } from '@components/shared/nav-button';
import { Input } from 'antd';
import React from 'react';
import styles from './password-restore.module.scss';

const STRENGTH_CRITERIA = [
  /^.{10,63}$/, // at least 10 chars
  /^(?=.*?[a-z])/, // at least 1 lower case char
  /^(?=.*?[A-Z])/, // at least 1 upper case char
  /^(?=.*?[0-9])/, //  at least 1 digit
  /^(?=.*?[" !"#$%&'()*+,-./:;<=>?@[\]^_`{|}~"])/ // at least 1 special char
];

type PasswordRestoreType = {
  onClick: (base: string, repeat:string) => void
  isCreate?: boolean
};

function ratePassword(password: string): number {
  return STRENGTH_CRITERIA.reduce((result, regExp) => {
    const unit = regExp.test(password) ? 1 : 0;
    const bonus = result === 4 ? 1 : 0;
    return result + unit + bonus;
  }, 0);
}
const BARS_MAX = 6;
function PasswordRestore({ onClick, isCreate }: PasswordRestoreType) {
  const [base, setBase] = React.useState('');
  const [repeat, setRepeat] = React.useState('');

  const points = ratePassword(base);

  const setInputState = (
    callback: React.Dispatch<React.SetStateAction<string>>
  ) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target) callback(e.target.value);
  };

  const onClickDecor = () => onClick(base, repeat);

  const setVisibleIcon = (visible:boolean) => (
    visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />);

  const bars = new Array(BARS_MAX).fill(null).map((v, index) => (index < points ? points : 0));

  const black = (num:any) => {
    switch (true) {
      case num >= 5:
        return 'black';
      case num === 3:
        return 'black';
      case num === 0:
        return 'rgba(0, 0, 0, 0.1)';
      default:
        return 'black';
    }
  };

  return (
    <div className={styles.wrapper}>
      <h2>Password</h2>

      <p className={styles.description}>
        Enter a strong password.
        <br />
        The password is specific to each client and is only store locally.
      </p>

      <div className={styles.wrapperInput}>
        {' '}
        <Input.Password
          className={styles.password}
          onChange={setInputState(setBase)}
          value={base}
          placeholder="Enter your password"
          iconRender={setVisibleIcon}
        />
        <Input.Password
          className={styles.password}
          onChange={setInputState(setRepeat)}
          value={repeat}
          placeholder="Confirm your password"
          iconRender={setVisibleIcon}
        />
        <div className={styles.wrapperList}>
          <ul className={styles.listStyled}>
            {bars.map((p, index) => (
              <li
                className={styles.listItemStyled}
                key={index}
                style={
                  { backgroundColor: black(p) }
                }
              />
            ))}
          </ul>
        </div>
      </div>
      <div className={styles.wrapperDescr}>
        <p className={styles.descrTitle}>
          Strong password needs to meet the following requirements:
        </p>
        <ul className={styles.list}>
          <li className={styles.listItem}>
            the length must be at least 10 characters
          </li>
          <li className={styles.listItem}>
            must contain at least one lowercase letter
          </li>
          <li className={styles.listItem}>
            must contain at least one uppercase letter
          </li>
          <li className={styles.listItem}>
            must contain at least one number
          </li>
        </ul>

      </div>
      <NavButton
        name={isCreate ? 'Create' : 'Get Started'}
        onClick={onClickDecor}
      />
      {/* </Space> */}
    </div>
  );
}
export default PasswordRestore;
