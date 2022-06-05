import { useObjectState } from '@libs/hooks/shared';
import { useEffect } from 'react';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { message } from 'antd';
import { useDispatch, useSelector } from '@libs/redux';
import { useSourc3Api } from '@components/context';
import { userThunk } from '@libs/action-creators/async';

const initialState = {
  visible: false,
  address: '',
  amount: 0,
  comment: '',
  offline: false
};

enum ErrMsg {
  ADDRESS = 'Field address not be full',
  AMOUNT = 'Field amount not be full'
}

const useManager = () => {
  const balance = useSelector((state) => state.app.balance);
  const dispatch = useDispatch();

  const api = useSourc3Api();

  const thunks = userThunk(api);

  const getWalletStatus = () => dispatch(thunks.getWalletStatus());

  const setWalletSendBeam = (
    amountValue: number,
    addressValue:string,
    commentValue:string
  ) => dispatch(thunks.setWalletSendBeam(
    amountValue,
    addressValue,
    commentValue
  ));

  const [state, setState] = useObjectState(initialState);
  const {
    visible, address, amount, comment, offline
  } = state;

  useEffect(() => getWalletStatus(), []);

  const showModal = () => {
    setState({
      address: '',
      amount: 0,
      comment: '',
      offline: false,
      visible: true
    });
  };

  const clear = () => setState({ visible: false });

  const handleOk = () => {
    if (!address) {
      message.error(ErrMsg.ADDRESS);
      return;
    }
    if (!amount) {
      message.error(ErrMsg.AMOUNT);
      return;
    }
    setWalletSendBeam(amount, address, comment);
    setState({ visible: false });
  };

  const handleCancel = () => setState({ visible: false });

  const handleAddressValue = (event:any) => setState({ address: event?.target.value });

  const handleAmountValue = (event:any) => {
    const target = event?.target.value;
    const regExp = /^-?\d+(\.\d*)?$/g;
    const value = target.match(regExp);
    setState({ amount: value });
  };

  const handleCommentValue = (event:any) => setState({ comment: event?.target.value });

  const handleOffline = (e:CheckboxChangeEvent) => {
    setState({ offline: e.target.checked });
  };

  return {
    balance,
    visible,
    offline,
    address,
    amount,
    comment,
    clear,
    handleOk,
    showModal,
    handleCommentValue,
    handleOffline,
    handleAmountValue,
    handleCancel,
    handleAddressValue
  };
};

export default useManager;
