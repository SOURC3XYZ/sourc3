// import { Button } from 'antd';
import { AppThunkDispatch, RootState } from '@libs/redux';
import { thunks } from '@libs/action-creators';
import { connect } from 'react-redux';
import { Button } from 'antd';
import Text from 'antd/lib/typography/Text';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './sign-up.module.css';
// import icon from '../../../../../assets/img/TurtuleZorro.png';

type SignUpProps = {
  seedPhrase: string | null,
  generateSeed: () => void,
};

const SignUp = ({
  generateSeed,
  seedPhrase
}: SignUpProps) => {
  const [isAllowed, setIsAllowed] = useState(false);

  const getSeed = () => {
    generateSeed();
    setIsAllowed(true);
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
        {isAllowed ? (
          <ol className={styles.list}>
            {seedPhrase && seedPhrase.split(' ').map((value, index) => (
              // eslint-disable-next-line
            <li key={index++}>{index}.{value}</li>
            ))}
          </ol>
        ) : ''}
        <div className={styles.btnNav}>
          {isAllowed ? (
            <Button
              style={{
                width: 150,
                borderRadius: 7
              }}
              onClick={() => (console.log(1))}
            >
              Complete verification

            </Button>
          ) : (
            <Button
              style={{
                width: 150,
                borderRadius: 7
              }}
              onClick={getSeed}
            >
              Generate
            </Button>
          )}
          <Button style={{ borderRadius: 7 }}>
            <Link to="/" onClick={() => { setIsAllowed(false); }}>Back</Link>
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
  mountWallet: () => {
    dispatch(thunks.mountWallet());
  },

  generateSeed: () => {
    dispatch(thunks.generateSeed());
  }
});
export default connect(mapState, mapDispatch)(SignUp);
