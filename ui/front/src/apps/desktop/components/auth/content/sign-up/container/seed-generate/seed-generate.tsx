import { AppThunkDispatch, RootState } from '@libs/redux';
import { thunks } from '@libs/action-creators';
import { connect } from 'react-redux';
import Text from 'antd/lib/typography/Text';
import { NavButton, SeedList } from '@components/shared';
import { WALLET } from '@libs/constants';
import styles from '../../sign-up.module.scss';

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
      {' '}
      <div className={styles.wrapper}>
        <Text>
          To start using PIT you need to first create an account.
          Each account is uniquely identified by a 12 word mnemonic
          phrase that is secret and should not be revealed to anyone.
          Make at least 2 copies of the phrase in case of emergency
        </Text>
        <SeedList
          data={seed}
          errors={errors}
        />
        <div className={styles.btnNav}>
          <NavButton
            onClick={next}
            name="Complete verification"
          />
        </div>
      </div>

    </>
  );
}
const mapState = ({ wallet: { seedPhrase } }: RootState) => ({
  seedPhrase
});

const mapDispatch = (dispatch: AppThunkDispatch) => ({

  generateSeed: () => {
    dispatch(thunks.generateSeed());
  }
});
export default connect(mapState, mapDispatch)(SignUp);
