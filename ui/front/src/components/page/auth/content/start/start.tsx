import { useEffect } from 'react';
import { connect } from 'react-redux';
import { thunks } from '@libs/action-creators';
import { AppThunkDispatch, RootState } from '@libs/redux';
import { NavButton } from '@components/shared';
import icon from '../../../../../assets/img/TurtuleZorro.png';
import styles from './start.module.css';

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
        <NavButton name="Sign in" link="/auth/login" />
        <NavButton name="Get Started" link="/auth/sign-up" />
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
