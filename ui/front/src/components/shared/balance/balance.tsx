import {
  Button, Menu, Dropdown
} from 'antd';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Send from './send';
import Receive from './receive';
import styles from './balance.module.css';

type BalancePropsType = {
  current:number;
};

function Balance({ current }:BalancePropsType) {
  const [isVisible, setIsVisible] = useState(false);
  const [visible, setVisible] = useState(false);

  const showModal = () => {
    setIsVisible(true);
  };
  const closeModal = () => {
    // e.preventDefault();
    setIsVisible(false);
  };
  const showModals = () => {
    setVisible(true);
  };
  const closeModals = () => {
    // e.preventDefault();
    setVisible(false);
  };

  const menu = (
    <Menu>
      <Menu.Item>
        <Button type="link" onClick={showModal}>Send</Button>
      </Menu.Item>
      <Menu.Item>
        <Button type="link" onClick={showModals}>Receive</Button>
      </Menu.Item>
      <Menu.Item>
        <Button type="link">
          <Link type="link" to="manager">
            Get More
          </Link>
        </Button>
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
          {' '}
          Current balance:
          <br />
          {current}
          {' '}
          SC3
        </Button>
      </Dropdown>
      <Send
        current={current}
        isVisible={isVisible}
        onClose={closeModal}
      />
      <Receive
        isVisible={visible}
        onClose={closeModals}
      />
    </div>
  );
}

export default Balance;
