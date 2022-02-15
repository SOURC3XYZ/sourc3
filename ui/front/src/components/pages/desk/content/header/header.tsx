// import { AppThunkDispatch, RootState } from '@libs/redux';
import { Button } from 'antd';
// import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AddButton, Balance, Profile } from './content';
import styles from './header.module.css';

type HeaderPropsType = {
  balance: number,
  isWeb?: boolean,
  pKey:string
};

const Header = ({ balance, isWeb, pKey }:HeaderPropsType) => (
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
    <Profile
      pKey={pKey}
    />
  </div>
);
// const mapState = ({
//   app: { balance }
// }: RootState) => ({
//   balance
// });

// const mapDispatch = (dispatch: AppThunkDispatch) => ({
// getWalletStatus: () => {
//   dispatch(thunks.getWalletStatus());
// }
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
// });

export default Header;
