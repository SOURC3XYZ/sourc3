import {
  Button, Menu, Dropdown
} from 'antd';
import { useState } from 'react';
import Send from './send';
import styles from './balance.module.css';

type BalancePropsType = {
  current:number;
};

const Balance = ({ current }:BalancePropsType) => {
  const [isVisible, seIsVisible] = useState(false);

  const showModal = () => {
    seIsVisible(true);
  };
  const closeModal = () => {
    seIsVisible(false);
  };

  const menu = (
    <Menu>
      <Menu.Item>
        <Button type="link">Send</Button>
      </Menu.Item>
      <Menu.Item>
        <Button type="link" onClick={showModal}>Receive</Button>
      </Menu.Item>
      <Menu.Item>
        <Button type="link">Get More</Button>
      </Menu.Item>
    </Menu>
  );

  return (
    <div className={styles.wrapper}>
      <Dropdown
        overlay={menu}
        placement="bottomCenter"
        trigger={['click']}
      >
        <Button style={{
          border: 'none', height: 60
        }}
        >
          {current}
          {' '}
          PIT
        </Button>
      </Dropdown>
      <Send
        current={current}
        isVisible={isVisible}
        onClose={closeModal}
      />
    </div>
  );
};

export default Balance;
