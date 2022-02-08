import { thunks } from '@libs/action-creators';
import { AppThunkDispatch, RootState } from '@libs/redux';
import { Button } from 'antd';
import { useEffect } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AddButton, Balance } from './content';
import styles from './header.module.css';

type HeaderPropsType = {
  getWalletStatus: () => void,
  balance: number,
  isWeb?: boolean
};

const Header = ({ balance, getWalletStatus, isWeb }:HeaderPropsType) => {
  useEffect(() => {
    getWalletStatus();
  }, [balance]);
  return (
    <div className={styles.wrapper}>
      {isWeb ? (
        <Button className={styles.toggle} type="link">
          <Link to="/main/repos/all/1">To Web</Link>
        </Button>
      ) : (
        <Button className={styles.toggle} type="link">
          <Link to="/mainDesk">To Desk</Link>
        </Button>
      )}
      <div>
        <Balance
          current={balance}
        />
      </div>
      <AddButton />
      <Button>PubKey</Button>
    </div>
  );
};

const mapState = ({
  app: { balance }
}: RootState) => ({
  balance
});

const mapDispatch = (dispatch: AppThunkDispatch) => ({
  getWalletStatus: () => {
    dispatch(thunks.getWalletStatus());
  }
  // getWalletAddressList: () => {
  //   dispatch(thunks.getWalletAddressList());
  // },
  // setWalletSendBeam: (
  //   amountValue: number, fromValue:string, addressValue:string,
  //   commentValue:string
  // ) => {
  //   console.log(fromValue);
  //   dispatch(thunks.setWalletSendBeam(amountValue, fromValue, addressValue,
  //     commentValue));
  // }
});

export default connect(mapState, mapDispatch)(Header);
