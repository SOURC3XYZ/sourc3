import {
  Button, Modal, Input, Tooltip, message
} from 'antd';
import {
  InfoCircleOutlined,
  UserOutlined,
  WechatOutlined
} from '@ant-design/icons';
import { useEffect } from 'react';
import { thunks } from '@libs/action-creators';
import { AppThunkDispatch, RootState } from '@libs/redux';
import { connect } from 'react-redux';
import { useObjectState } from '@libs/hooks/shared';

type SendPropsType = {
  current:number;
  isVisible:boolean;
  onClose: () => void;
  // getWalletAddressList: ()=> void
  setWalletSendBeam: (
    amountValue: number,
    addressValue:string,
    fromValue:string,
    commentValue:string)=> void
  addrList: string,
};

function Send({
  current, isVisible,
  addrList,
  onClose,
  // getWalletAddressList,
  setWalletSendBeam
}:SendPropsType) {
  const initialState = {
    visible: false,
    adress: '',
    amount: 0,
    comment: ''
  };

  const [state, setState] = useObjectState(initialState);

  const showModal = () => {
    setState({
      adress: '',
      amount: 0,
      comment: '',
      visible: true
    });
  };

  const handleCancel = () => {
    setState({ visible: false });
    onClose();
  };
  useEffect(() => {
    // getWalletAddressList();
    if (isVisible) {
      showModal();
    } else {
      handleCancel();
    }
  }, [isVisible]);

  const {
    visible, adress, amount, comment
  } = state;
    // const [confirmLoading, setConfirmLoading] = useState(false);
    // const [modalText, setModalText] = useState('Content of the modal');

  const handleOk = () => {
    if (!adress) {
      message.error('Field address not be full');
      return;
    }
    if (!amount) {
      message.error('Field amount not be full');
      return;
    }
    setWalletSendBeam(amount, addrList, adress, comment);
    setState({ visible: false });
  };

  const handleAddressValue = (event:any) => {
    setState({ adress: event?.target.value });
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

  return (
    <Modal
      title="SEND BEAM"
      visible={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="back" onClick={handleCancel}>
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
          value={adress}
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
              <span className="beam">BEAM</span>
              <Tooltip title={`Max available:${current} BEAM`}>
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
    </Modal>
  );
}
const mapState = ({ app: { balance, addrList } }: RootState) => ({
  balance,
  addrList
});
const mapDispatch = (dispatch: AppThunkDispatch) => ({
  getWalletStatus: () => {
    dispatch(thunks.getWalletStatus());
  },
  getWalletAddressList: () => {
    dispatch(thunks.getWalletAddressList());
  },
  setWalletSendBeam: (
    amountValue: number,
    fromValue:string,
    addressValue:string,
    commentValue:string
  ) => dispatch(thunks.setWalletSendBeam(
    amountValue,
    fromValue,
    addressValue,
    commentValue
  ))
});

export default connect(mapState, mapDispatch)(Send);
