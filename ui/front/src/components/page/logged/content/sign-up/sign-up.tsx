// import { Button } from 'antd';
import { AppThunkDispatch, RootState } from '@libs/redux';
import { thunks } from '@libs/action-creators';
import { connect } from 'react-redux';
import { Button } from 'antd';
import Text from 'antd/lib/typography/Text';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './sign-up.module.css';
// import icon from '../../../../../assets/img/TurtuleZorro.png';

type SignUpProps = {
  seedPhrase: string | null,
  generateSeed: () => void,
  mountWallet: () => void,
};

const SignUp = ({
  mountWallet,
  generateSeed,
  seedPhrase
}: SignUpProps) => {
  useEffect(() => {
    mountWallet();
  }, []);

  const getSeed = () => {
    generateSeed();
  };

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
        <div className={styles.btnNav}>
          <Button style={{ borderRadius: 7 }}>
            <Link to="/">Back</Link>
          </Button>
          <Button
            style={{
              width: 150,
              borderRadius: 7
            }}
            onClick={getSeed}
          >
            Generate

          </Button>
        </div>
        <p>{seedPhrase}</p>
      </div>

    </>
  );
};
const mapState = ({ wallet: { seedPhrase } }: RootState) => ({
  seedPhrase
});

const mapDispatch = (dispatch: AppThunkDispatch) => ({
  mountWallet: () => {
    dispatch(thunks.mountWallet());
  },

  generateSeed: () => {
    dispatch(thunks.generateSeed());
  }
});
export default connect(mapState, mapDispatch)(SignUp);
