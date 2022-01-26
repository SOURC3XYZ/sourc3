import { Button } from 'antd';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { connect } from 'react-redux';
import { thunks } from '@libs/action-creators';
import { AppThunkDispatch, RootState } from '@libs/redux';
import styles from './start.module.css';
import icon from '../../../../../assets/img/TurtuleZorro.png';

type StartProps = {
  mountWallet: () => void
};

const Start = ({
  mountWallet
}: StartProps) => {
  useEffect(() => {
    mountWallet();
  }, []);

  return (
    <div className={styles.wrapper}>
      <img
        style={{
          maxWidth: '13.4375rem',
          maxHeight: '14.6875rem'
        }}
        src={icon}
        alt="Incognito"
      />
      <div className={styles.btnNav}>
        <Button style={{ borderRadius: 7 }}>
          <Link to="/auth/login">Sign in</Link>
        </Button>
        <Button style={{ borderRadius: 7 }}>
          <Link to="/auth/sign-up">Get Started</Link>
        </Button>
      </div>
    </div>
  );
};

const mapState = ({ wallet: { seedPhrase } }: RootState) => ({
  seedPhrase
});

const mapDispatch = (dispatch: AppThunkDispatch) => ({
  mountWallet: () => {
    dispatch(thunks.mountWallet());
  }
});

export default connect(mapState, mapDispatch)(Start);
