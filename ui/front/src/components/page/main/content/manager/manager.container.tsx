import { useEffect, useState } from 'react';
import {
  Button, Modal, Input, Tooltip, Row, Col, Statistic, message
} from 'antd';
import {
  InfoCircleOutlined,
  UserOutlined,
  WechatOutlined
} from '@ant-design/icons';
import { thunks } from '@libs/action-creators';
import { connect } from 'react-redux';
import { AppThunkDispatch, RootState } from '@libs/redux';
import styles from './manager.module.css';

type ManagerProps = {
  getWalletStatus: () => void,
  getWalletAddressList: ()=> void
  setWalletSendBeam: (
    amountValue: number,
    addressValue:string,
    fromValue:string,
    commentValue:string)=> void
  balance: number,
  addrList: string,
};

const Manager = ({
  getWalletStatus,
  getWalletAddressList,
  setWalletSendBeam,
  balance,
  addrList
}: ManagerProps) => {
  const [visible, setVisible] = useState(false);
  // const [confirmLoading, setConfirmLoading] = useState(false);
  // const [modalText, setModalText] = useState('Content of the modal');

  const [addressValue, setAddressValue] = useState('');
  const [amountValue, setAmountValue] = useState(0);
  const [commentValue, setCommentValue] = useState('');
  const [fromValue] = useState(addrList);

  useEffect(() => {
    getWalletStatus();
    getWalletAddressList();
  }, []);

  const showModal = () => {
    setAddressValue('');
    setAmountValue(0);
    setCommentValue('');
    setVisible(true);
  };

  const clear = () => {
    setVisible(false);
  };

  const handleOk = () => {
    if (!addressValue) {
      message.error('Field address not be full');
      return;
    }
    if (!amountValue) {
      message.error('Field amount not be full');
      return;
    }
    setWalletSendBeam(amountValue, fromValue, addressValue, commentValue);
    setVisible(false);
  };

  const handleCancel = () => {
    setVisible(false);
  };
  const handleAddressValue = (event:any) => {
    setAddressValue(event?.target.value);
  };
  const handleAmountValue = (event:any) => {
    setAmountValue(Number(event?.target.value));
  };
  const handleCommentValue = (event:any) => {
    setCommentValue(event?.target.value);
  };

  return (
    <>
      <div className={styles.info}>
        <Row gutter={16}>
          {/* <Col span={12}>
          <Statistic title="Active Users" value={112893} />
        </Col> */}
          <Col span={25}>
            <Statistic title="Account Balance:" value={`${balance} BEAM`} />
            <div className={styles.balanceBtn}>
              <Button
                type="primary"
                shape="round"
                size="small"
                onClick={showModal}
              >
                SEND
              </Button>
              {/* <Button
              type="primary"
              shape="round"
              size="small"
              onClick={showModal}
            >
              RECIEVE
            </Button> */}
            </div>
          </Col>
        </Row>
      </div>
      <Modal
        title="SEND BEAM"
        visible={visible}
        // confirmLoading={confirmLoading}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={clear}>
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
            value={addressValue}
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
            type="number"
            id="amount"
            value={amountValue}
            placeholder="0"
            suffix={(
              <>
                <span className={styles.beam}>BEAM</span>
                <Tooltip title={`Max available:${balance} BEAM`}>
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
            value={commentValue}
            prefix={<WechatOutlined />}
            placeholder="Comment"
            onChange={handleCommentValue}
          />

        </label>
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
    dispatch(thunks.setWalletSendBeam(amountValue, fromValue, addressValue,
      commentValue));
  }
});
export default connect(mapState, mapDispatch)(Manager);
