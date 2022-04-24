import { useEffect } from 'react';
import {
  Button, Modal, Input, Tooltip, Row, Col, Statistic, message, Card
} from 'antd';
import {
  InfoCircleOutlined,
  UserOutlined,
  WechatOutlined
} from '@ant-design/icons';
import { thunks } from '@libs/action-creators';
import { connect } from 'react-redux';
import { AppThunkDispatch, RootState } from '@libs/redux';
import { Link } from 'react-router-dom';
import { useObjectState } from '@libs/hooks/shared';
import styles from './manager.module.css';

type ManagerProps = {
  getWalletStatus: () => void,
  setWalletSendBeam: (
    amountValue: number,
    addressValue:string,
    fromValue:string,
    commentValue:string)=> void
  balance: number,
  addrList: string,
  isDesk?: boolean
};

const initialState = {
  visible: false,
  adress: '',
  amount: 0,
  comment: ''
};

function Manager({
  getWalletStatus,
  setWalletSendBeam,
  balance,
  addrList,
  isDesk
}: ManagerProps) {
  const [state, setState] = useObjectState(initialState);
  const {
    visible, adress, amount, comment
  } = state;

  useEffect(() => getWalletStatus(), []);

  const showModal = () => {
    setState({
      adress: '',
      amount: 0,
      comment: '',
      visible: true
    });
  };

  const clear = () => setState({ visible: false });

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

  const handleCancel = () => setState({ visible: false });

  const handleAddressValue = (event:any) => setState({ adress: event?.target.value });

  const handleAmountValue = (event:any) => {
    const target = event?.target.value;
    const regExp = /^-?\d+(\.\d*)?$/g;
    const value = target.match(regExp);
    setState({ amount: value });
  };

  const handleCommentValue = (event:any) => {
    setState({ comment: event?.target.value });
  };
  console.log(amount);
  return (
    <>
      {
        isDesk && (<Link to="/main">Back</Link>)
      }
      <div className={styles.info}>
        <Card
          title="Finance"
          style={{ width: 300, height: 200, marginLeft: 10 }}
        >
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
        </Card>
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
            value={comment}
            prefix={<WechatOutlined />}
            placeholder="Comment"
            onChange={handleCommentValue}
          />

        </label>
      </Modal>
    </>
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
    // dispatch(thunks.getWalletAddressList());
  },
  setWalletSendBeam: (
    amountValue: number,
    fromValue:string,
    addressValue:string,
    commentValue:string
  ) => {
    console.log(fromValue);
    dispatch(thunks.setWalletSendBeam(
      amountValue,
      fromValue,
      addressValue,
      commentValue
    ));
  }
});
export default connect(mapState, mapDispatch)(Manager);
