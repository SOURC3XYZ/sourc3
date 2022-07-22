import styles from './auth-btn-block.module.scss';

type AuthBtnBLockProps = {
  children: JSX.Element,
  className?: string;
};

function AuthBtnBlock({ children, className }: AuthBtnBLockProps) {
  const classes = className || styles.btnBlock;
  return (
    <div className={classes}>
      {children}
    </div>
  );
}

export default AuthBtnBlock;
