import { AuthBtnBlock, NavButton, SeedList } from '@components/shared';
import { WALLET } from '@libs/constants';
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
              onClick={next}
              name="Complete phrase"
            />
            <NavButton
              name="Back"
              link="/auth/"
            />
          </>
        </AuthBtnBlock>
      </div>
    </>
  );
}

export default SignUp;
