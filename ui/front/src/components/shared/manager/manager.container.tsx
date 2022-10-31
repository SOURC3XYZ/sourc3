import {
  Button, Modal, Input, Tooltip, Row, Col, Statistic, Card, Checkbox
} from 'antd';
import {
  InfoCircleOutlined,
  UserOutlined,
  WechatOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useManager } from '@libs/hooks/container/manager';
import styles from './manager.module.css';

type ManagerProps = {
  isDesk?: boolean
};

function Manager({ isDesk }: ManagerProps) {
  const talonProps = useManager();

  const {
    balance,
    visible,
    offline,
    address,
    comment,
    amount,
    clear,
    showModal,
    handleOk,
    handleCommentValue,
    handleOffline,
    handleAmountValue,
    handleCancel,
    handleAddressValue
  } = talonProps;

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
              </div>
            </Col>
          </Row>
        </Card>
      </div>
      <Modal
        title="SEND BEAM"
        open={visible}
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
          <Input
            id="comment"
            value={comment}
            prefix={<WechatOutlined />}
            placeholder="Comment"
            onChange={handleCommentValue}
          />
        </label>
        <br />
        <br />
        <label htmlFor="offline">
          <Checkbox checked={offline} onChange={handleOffline}>Offline</Checkbox>
        </label>
      </Modal>
    </>
  );
}

export default Manager;
