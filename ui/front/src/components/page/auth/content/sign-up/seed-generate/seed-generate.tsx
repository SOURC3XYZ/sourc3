// import { Button } from 'antd';
import { AppThunkDispatch, RootState } from '@libs/redux';
import { thunks } from '@libs/action-creators';
import { connect } from 'react-redux';
import { Button } from 'antd';
import Text from 'antd/lib/typography/Text';
import { SeedList } from '@components/shared';
import { WALLET } from '@libs/constants';
import styles from '../sign-up.module.css';

type SignUpProps = {
  seed: string[],
  next: ()=>void
};

const SignUp = ({
  seed,
  next
}: SignUpProps) => {
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
          <Button
            style={{
              width: 150,
              borderRadius: 7
            }}
            onClick={next}
          >
            Complete verification
          </Button>
        </div>
      </div>

    </>
  );
};
const mapState = ({ wallet: { seedPhrase } }: RootState) => ({
  seedPhrase
});

const mapDispatch = (dispatch: AppThunkDispatch) => ({

  generateSeed: () => {
    dispatch(thunks.generateSeed());
  }
});
export default connect(mapState, mapDispatch)(SignUp);
