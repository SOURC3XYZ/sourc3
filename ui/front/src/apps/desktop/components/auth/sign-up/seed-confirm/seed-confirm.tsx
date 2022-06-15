import { AuthBtnBlock, NavButton, SeedList } from '@components/shared';
import { WALLET } from '@libs/constants';
import React, { useEffect, useState } from 'react';
import styles from './seed-confirm.module.scss';

type SeedConfirmType = {
  seedGenerated: string[],
  next: () => void
};

function SeedConfirm({ seedGenerated, next }:SeedConfirmType) {
  const emptyErrors = new Array(WALLET.SEED_PHRASE_COUNT).fill(false);
  const emptySeed = new Array(WALLET.SEED_PHRASE_COUNT).fill('');

  const [isDisabled, setIsDisabled] = useState(true);
  const [seed, setSeed] = useState(emptySeed);
  const [errors, setErrors] = useState(emptyErrors);

  const checkTrue = (errs:boolean[]) => {
    const checked = errs;
    if (checked.filter((el) => el === true)
      .length === WALLET.SEED_CONFIRM_PHRASE_COUNT) {
      setIsDisabled(false);
    } else setIsDisabled(true);
  };

  useEffect(() => {
    checkTrue(errors);
  }, [seed]);

  const validateSeed = (
    seedOrig:string[],
    word:string,
    i:number,
    errorsArr:boolean[]
  ) => {
    const errorsCheck = errorsArr;
    seedOrig.map((el, id) => {
      if (id === i) {
        if (el !== word) {
          errorsCheck[i] = false;
        } else {
          errorsCheck[i] = true;
        }
      }
      return errorsCheck;
    });
    setErrors(errorsCheck);
    return errorsCheck;
  };
  const addSeed = (seedUpdate:string[]) => {
    setSeed(seedUpdate);
  };
  const validateDecor = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const { index } = e.target.dataset as DOMStringMap;
    const word = e.target.value;
    const seedCopy = [...seed];
    validateSeed(seedGenerated, word, Number(index), errors);
    seedCopy.splice(Number(index), 1, word);
    addSeed(seedCopy);
  };

  return (
    <div className={styles.wrapper}>
      <h2>Confirmation</h2>
      <p className={styles.description}>
        Enter the words from the secret phrase corresponding
        <br />
        the numbers shown below.
      </p>
      <SeedList
        listConfirm
        isShuffle
        isSlice
        data={seed}
        errors={errors}
        onInput={validateDecor}
      />
      <div className={styles.btnBlock}>
        <AuthBtnBlock>
          <>
            <NavButton
              inlineStyles={{ width: '278px' }}
              isDisabled={isDisabled}
              onClick={next}
              name="Confirm phrase"
            />
            <NavButton
              inlineStyles={{ width: '278px' }}
              name="Confirm later"
              link="/auth/"
            />
          </>
        </AuthBtnBlock>
      </div>
    </div>
  );
}

export default SeedConfirm;
