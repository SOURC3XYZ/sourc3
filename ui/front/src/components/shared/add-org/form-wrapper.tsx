import { NavButton } from '@components/shared';
import styles from './edit-form.module.scss';

type FormWrapperProps = {
  title: string;
  children:JSX.Element;
  isDisabled: boolean;
  goBack: () => void;
  handleOk: () => void;
};

function FormWrapper({
  title, children, isDisabled, goBack, handleOk
}:FormWrapperProps) {
  return (
    <div className={styles.main}>
      <h4>{title}</h4>
      <div className={styles.wrapper}>
        {children}
      </div>
      <div className={styles.buttons}>
        <NavButton
          onClick={goBack}
          name="Cancel"
        />
        <NavButton
          onClick={handleOk}
          name="Add"
          isDisabled={isDisabled}
        />
      </div>

    </div>
  );
}

export default FormWrapper;
