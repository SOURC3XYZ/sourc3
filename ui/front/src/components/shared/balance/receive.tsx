import {
  Button, Modal, Typography
} from 'antd';
import { useEffect, useState } from 'react';
import { thunks } from '@libs/action-creators';
import { AppThunkDispatch, RootState } from '@libs/redux';
import { connect } from 'react-redux';
import { PromiseArg } from '@types';

  type ReceivePropsType = {
    isVisible:boolean;
    onClose: () => void;
    createAddressList: (resolve: PromiseArg<{ address: string }>) => void;
  };

function Receive({
  isVisible,
  onClose,
  createAddressList
  // getWalletAddressList
}:ReceivePropsType) {
  const [visible, setVisible] = useState(false);

  const [newAddress, setNewAddress] = useState<string | null>(null);

  const showModal = () => {
    setVisible(true);
  };

  const handleCancel = () => {
    setVisible(false);
    onClose();
  };

  const createAddressPromise = () => new Promise(
    (resolve:PromiseArg<{
      address: string;
    }>) => {
      setNewAddress(null);
      createAddressList(resolve);
    }
  );

  useEffect(() => {
    // getWalletAddressList();
    if (isVisible) {
      showModal();
      createAddressPromise()
        .then((data) => setNewAddress(data?.address || 'error'));
    } else {
      handleCancel();
    }
  }, [isVisible]);

  const handleOk = () => {
    handleCancel();
  };

  const content = (
    <Typography.Text copyable={newAddress ? { text: newAddress } : false}>
      {newAddress || 'loading...'}
    </Typography.Text>
  );

  return (
    <Modal
      title="RECEIVE SC3"
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
      {content}
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
  createAddressList: (
    resolve: PromiseArg<{ address: string }>,
    message:string = 'john smith'
  ) => {
    dispatch(thunks.createAddress(message, resolve));
  },
  setWalletSendBeam: (
    amountValue: number,
    addressValue:string,
    commentValue:string
  ) => {
    dispatch(thunks.setWalletSendBeam(
      amountValue,
      addressValue,
      commentValue
    ));
  }
});

export default connect(mapState, mapDispatch)(Receive);
