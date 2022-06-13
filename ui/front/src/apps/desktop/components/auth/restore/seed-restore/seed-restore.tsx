import { AuthBtnBlock, NavButton, SeedList } from '@components/shared';
import { WALLET } from '@libs/constants';
import { useEffect, useState } from 'react';
import styles from './seed-restore.module.scss';

type SeedRestoreProps = {
  seed: string[];
  errors: boolean[];
  validate: (seed: string []) => void;
  validatePasted: (str: string[]) => void;
  next: () => void;
};

function SeedRestore({
  seed, errors, validate, validatePasted, next
}:SeedRestoreProps) {
  const [isDisabled, setIsDisabled] = useState(true);

  useEffect(() => {
    setIsDisabled(errors.some((el:boolean) => el === false));
  }, [errors]);

  const validateDecor = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    e.preventDefault();
    const { index } = e.target.dataset as DOMStringMap;
    const word = e.target.value;
    const seedCopy = [...seed];
    seedCopy.splice(Number(index), 1, word);
    validate(seedCopy);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const seedArr = e.target.value.split(';');
    if (seedArr.length === WALLET.SEED_PHRASE_COUNT) {
      validatePasted(seedArr);
    }
  };
  return (
    <div className={styles.wrapper}>
      <h2>Secret phrase</h2>
      <p className={styles.description}>
        Enter the words from the secret phrase corresponding
        the numbers shown below.  You can skip the confirmation.
      </p>
      <SeedList
        data={seed}
        errors={errors}
        onInput={validateDecor}
        validatePasted={handlePaste}
      />
      <div className={styles.btnBlockWrapper}>
        <AuthBtnBlock>
          <>
            <NavButton
              isDisabled={isDisabled}
              onClick={next}
              name="Complete verification"
            />
            <NavButton
              name="Back"
              link="/auth/login"
            />
          </>
        </AuthBtnBlock>
      </div>
    </div>
  );
}

export default SeedRestore;