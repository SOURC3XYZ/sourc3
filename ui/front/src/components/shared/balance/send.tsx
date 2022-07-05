import {
  Button, Modal, Input, Tooltip, message
} from 'antd';
import {
  InfoCircleOutlined,
  UserOutlined,
  WechatOutlined
} from '@ant-design/icons';
import { useEffect } from 'react';
import { useObjectState } from '@libs/hooks/shared';
// import Checkbox, { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { useUserAction } from '@libs/hooks/thunk';

type SendPropsType = {
  current:number;
  isVisible:boolean;
  onClose: () => void;
  // getWalletAddressList: ()=> void
};

function Send({
  current,
  isVisible,
  onClose
}:SendPropsType) {
  const initialState = {
    visible: false,
    address: '',
    amount: 0,
    comment: '',
    offline: false
  };

  const { setWalletSendBeam } = useUserAction();

  const [state, setState] = useObjectState(initialState);

  const showModal = () => {
    setState({
      address: '',
      amount: 0,
      comment: '',
      visible: true,
      offline: false
    });
  };

  const handleClose = () => {
    setState({ visible: false });
    onClose();
  };
  useEffect(() => {
    if (isVisible) {
      showModal();
    } else {
      handleClose();
    }
  }, [isVisible]);

  const {
    visible, address, amount, comment, offline
  } = state;

  const handleOk = () => {
    if (!address) {
      message.error('Field address not be full');
      return;
    }
    if (!amount) {
      message.error('Field amount not be full');
      return;
    }
    setWalletSendBeam(amount, address, comment, offline);
    handleClose();
  };

  const handleAddressValue = (event:any) => {
    setState({ address: event?.target.value });
  };
  const handleAmountValue = (event:any) => {
    const target = event?.target.value;
    const regExp = /^-?\d+(\.\d*)?$/g;
    const value = target.match(regExp);
    setState({ amount: value });
  };

  const handleCommentValue = (event:any) => {
    setState({ comment: event?.target.value });
  };

  // const handleOffline = (e:CheckboxChangeEvent) => {
  //   setState({ offline: e.target.checked });
  // };

  return (
    <Modal
      title="SEND SC3"
      visible={visible}
      onCancel={handleClose}
      footer={[
        <Button key="back" onClick={handleClose}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleOk}>
          SEND
        </Button>
      ]}
    >
      <label htmlFor="address">
        SEND TO:
        <Input
          id="address"
          prefix={<UserOutlined className="site-form-item-icon" />}
          placeholder="Past recipient address here"
          onChange={handleAddressValue}
          value={address}
          name="address"
          suffix={(
            <Tooltip title="Extra information">
              <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
            </Tooltip>
          )}
        />
      </label>
      <br />
      <br />
      <label htmlFor="amount">
        AMOUNT:
        <Input
          id="amount"
          value={amount}
          // min={0}
          placeholder="0"
          suffix={(
            <>
              <span className="beam">SC3</span>
              <Tooltip title={`Max available:${current} SC3`}>
                <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
              </Tooltip>

            </>
          )}
          onChange={handleAmountValue}
        />
      </label>
      <br />
      <br />
      <label htmlFor="comment">
        Comment
        {' '}
        <Input
          id="comment"
          value={comment}
          prefix={<WechatOutlined />}
          placeholder="Comment"
          onChange={handleCommentValue}
        />

      </label>
      {/* <Checkbox checked={offline} onChange={handleOffline}>
        Offline
      </Checkbox> */}
    </Modal>
  );
}
// const mapState = ({ app: { balance, addrList } }: RootState) => ({
//   balance,
//   addrList
// });
// const mapDispatch = (dispatch: AppThunkDispatch) => ({
//   getWalletStatus: () => {
//     dispatch(thunks.getWalletStatus());
//   },
//   getWalletAddressList: () => {
//     dispatch(thunks.getWalletAddressList());
//   },
//   setWalletSendBeam: (
//     amountValue: number,
//     fromValue:string,
//     commentValue:string,
//     offline: boolean
//   ) => dispatch(thunks.setWalletSendBeam(
//     amountValue,
//     fromValue,
//     commentValue,
//     offline
//   ))
// });

export default Send;
