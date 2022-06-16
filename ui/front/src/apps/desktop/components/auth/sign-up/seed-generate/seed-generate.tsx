import { NavButton, SeedList } from '@components/shared';
import { BackButton } from '@components/shared/back-button';
import { Popup } from '@components/shared/popup';
import { WALLET } from '@libs/constants';
import { useState } from 'react';
import styles from './seed-generate.module.scss';

type SignUpProps = {
  seed: string[],
  next: ()=>void
  back: ()=>void
};

function SignUp({
  seed,
  next,
  back
}: SignUpProps) {
  const errors = new Array(WALLET.SEED_PHRASE_COUNT).fill(true);

  const [isPopup, setIsPopup] = useState(false);
  const onCancel = () => {
    setIsPopup(false);
  };

  return (
    <>
      <BackButton onClick={back} />
      <div className={styles.wrapper}>
        <h2>Secret phrase</h2>
        <p className={styles.description}>
          Copy the words of the secret phrase
          {' '}
          <b>(The order is important!)</b>
          .
          <br />
          Without the phrase you will not be able to recover your account.
        </p>
        <SeedList
          listGenerated
          readOnly
          data={seed}
          errors={errors}
        />
        <div className={styles.btnBlock}>
          <NavButton
            onClick={() => setIsPopup(true)}
            name="Confirm phrase"
            active
          />
          {/* <NavButton
            name="Confirm later"
            link="/auth/"
          /> */}
        </div>
        <Popup
          visible={isPopup}
          title="Save secret phrase"
          onCancel={onCancel}
          agree
          confirmButton={(
            <NavButton
              name="I understand"
              inlineStyles={{ width: '278px' }}
              onClick={next}
              active
            />
          )}
        >
          <span>
            It is stricly recommended to write down the secret phrase on a paper.
            <br />
            Storing it in a files makes it prone to cyber attacks and therefore less secure.
          </span>
        </Popup>
      </div>
    </>
  );
}

export default SignUp;
