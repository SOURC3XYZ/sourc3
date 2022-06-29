import { NavButton, SeedList } from '@components/shared';
import { BackButton } from '@components/shared/back-button';
import { WALLET } from '@libs/constants';
import { useEffect, useState } from 'react';
import styles from './seed-restore.module.scss';

type SeedRestoreProps = {
  seed: string[];
  errors: boolean[];
  validate: (seed: string []) => void;
  validatePasted: (str: string[]) => void;
  next: () => void;
  back: () => void;
};

function SeedRestore({
  seed, errors, validate, validatePasted, next, back
}:SeedRestoreProps) {
  const [isDisabled, setIsDisabled] = useState(true);

  useEffect(() => {
    setIsDisabled(errors.some((el:boolean) => el === false));
  }, [errors]);
  const REGEXP_SEED = /(\w+;){12}/;
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
    const seedArr = e.clipboardData.getData('text');
    if (REGEXP_SEED.test(seedArr)) {
      const seedPaste = seedArr.split(';').slice(0, WALLET.SEED_PHRASE_COUNT);
      e.preventDefault();
      validatePasted(seedPaste);
    }
  };
  return (
    <div className={styles.wrapper}>
      <BackButton onClick={back} />
      <h2>Restore account</h2>
      <p className={styles.description}>
        Type in or paste your secret phrase.
      </p>
      <SeedList
        data={seed}
        errors={errors}
        onInput={validateDecor}
        validatePasted={handlePaste}
      />
      <div className={styles.btnBlock}>
        <NavButton
          isDisabled={isDisabled}
          onClick={next}
          name="Next"
          active
        />
      </div>
    </div>
  );
}

export default SeedRestore;
