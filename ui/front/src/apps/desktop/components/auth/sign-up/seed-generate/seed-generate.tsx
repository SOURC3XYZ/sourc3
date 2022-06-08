import { AuthBtnBlock, NavButton, SeedList } from '@components/shared';
import { Popup } from '@components/shared/popup';
import { WALLET } from '@libs/constants';
import { useState } from 'react';
import styles from '../sign-up.module.scss';

type SignUpProps = {
  seed: string[],
  next: ()=>void
};

function SignUp({
  seed,
  next
}: SignUpProps) {
  const errors = new Array(WALLET.SEED_PHRASE_COUNT).fill(true);

  const [isPopup, setIsPopup] = useState(false);
  const onCancel = () => {
    setIsPopup(false);
  };

  return (
    <>
      <h2>Secret phrase</h2>
      <p className={styles.description}>
        Copy the words of the secret phrase (The order is important!).
        Without the phrase you will not be able to recover your account.
      </p>
      <SeedList
        readOnly
        data={seed}
        errors={errors}
      />
      <div className={styles.btnBlock}>
        <AuthBtnBlock>
          <>
            <NavButton
              onClick={() => setIsPopup(true)}
              name="Complete phrase"
            />
            <NavButton
              name="Back"
              link="/auth/"
            />
          </>
        </AuthBtnBlock>
      </div>
      <Popup
        visible={isPopup}
        title="Restore wallet or create new one"
        onCancel={onCancel}
        agree
        confirmButton={(
          <NavButton
            name="I understand"
            inlineStyles={{ width: '278px' }}
            onClick={next}
          />
        )}
      >
        <span>
          It is stricly recommended to write down the secret phrase on a paper.
          Storing it in a files makes it prone to cyber attacks and therefore less secure
        </span>
      </Popup>
    </>
  );
}

export default SignUp;
