import {
  Button, Modal, Typography
} from 'antd';
import { useEffect, useState } from 'react';
import { thunks } from '@libs/action-creators';
import { AppThunkDispatch, RootState } from '@libs/redux';
import { connect } from 'react-redux';

  type ReceivePropsType = {
    isVisible:boolean;
    onClose: () => void;
    // getWalletAddressList: ()=> void
    addrList: string,
  };

const Receive = ({
  isVisible,
  addrList,
  onClose
  // getWalletAddressList
}:ReceivePropsType) => {
  const [visible, setVisible] = useState(false);
  const showModal = () => {
    setVisible(true);
  };

  const handleCancel = () => {
    setVisible(false);
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

  // const [confirmLoading, setConfirmLoading] = useState(false);
  // const [modalText, setModalText] = useState('Content of the modal');

  const handleOk = () => {
    handleCancel();
  };

  return (
    <>
      <Modal
        title="RECEIVE PIT"
        visible={visible}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleOk}>
            OK
          </Button>
        ]}
      >
        <Typography.Text
          copyable={{ text: addrList }}
        >
          {addrList}
        </Typography.Text>
      </Modal>
    </>
  );
};
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
    amountValue: number, fromValue:string, addressValue:string,
    commentValue:string
  ) => {
    console.log(fromValue);
    dispatch(thunks.setWalletSendBeam(amountValue, fromValue, addressValue,
      commentValue));
  }
});

export default connect(mapState, mapDispatch)(Receive);
