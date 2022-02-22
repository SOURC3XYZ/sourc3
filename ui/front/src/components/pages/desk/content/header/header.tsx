// import { AppThunkDispatch, RootState } from '@libs/redux';
// import { connect } from 'react-redux';
import { AddButton, Balance, Profile } from './content';
import styles from './header.module.css';

type HeaderPropsType = {
  pKey:string
  balance: number,
  isWeb?: boolean
};

const Header = ({ balance, pKey }:HeaderPropsType) => (
  <div className={styles.wrapper}>
    <div className={styles.nav}>
      <Balance current={balance}/>
      <AddButton />
      <Profile pKey={pKey} />
    </div>
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
