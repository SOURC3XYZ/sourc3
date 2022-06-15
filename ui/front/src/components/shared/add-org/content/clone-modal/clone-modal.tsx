import { UploadOutlined } from '@ant-design/icons';
import { useObjectState } from '@libs/hooks/shared';
import {
  Button, Col, Input, Modal, Row
} from 'antd';
import { ChangeEventHandler } from 'react';

type MessageType = {
  type: string;
  path: string
};

type CloneModalProps = {
  handleOk: () => void;
  handleCancel: () => void;
  cloneRepo: (local: string, remote:string) => void;
};

const initial = {
  local: '',
  remote: ''
};

function CloneModal({ handleOk, handleCancel, cloneRepo }: CloneModalProps) {
  const [{ local, remote }, setState] = useObjectState(initial);

  const onClick = () => {
    window.postMessage({
      type: 'select-dirs'
    });
    const messageHandler = (e:MessageEvent<MessageType>) => {
      if (e.data.type === 'select-dirs-answer') {
        setState({ local: e.data.path });
        window.removeEventListener('message', messageHandler);
      }
    };

    window.addEventListener('message', messageHandler);
  };

  const onOk = () => {
    cloneRepo(local, remote);
    handleOk();
  };

  const onLocalChange:ChangeEventHandler = (e) => setState(
    { local: e.target.value }
  );
  const onRemoteChange:ChangeEventHandler = (e) => setState(
    { remote: e.target.value }
  );
  return (
    <Modal
      visible
      onOk={onOk}
      onCancel={handleCancel}
      closable={false}
    >
      <Row>
        <Col>
          <Input
            readOnly
            placeholder="local"
            value={local}
            onChange={onLocalChange}
          />

        </Col>

        <Col>
          <Button onClick={onClick} icon={<UploadOutlined />}>
            Upload Directory
          </Button>
        </Col>
      </Row>
      <Row>
        <Col>
          <Input
            placeholder="remote"
            value={remote}
            onChange={onRemoteChange}
          />
        </Col>
      </Row>
    </Modal>
  );
}

export default CloneModal;
