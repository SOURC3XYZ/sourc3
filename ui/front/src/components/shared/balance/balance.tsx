import {
  Button, Menu, Dropdown
} from 'antd';
import { useState } from 'react';
// import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Send from './send';
import Receive from './receive';
import styles from './balance.module.scss';

function Balance() {
  const [isVisible, setIsVisible] = useState(false);
  const [visible, setVisible] = useState(false);

  const balance = useSelector((state) => state.app.balance);

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
        <Button type="link" onClick={showModal} className={styles.button}>Send</Button>
      </Menu.Item>
      <Menu.Item>
        <Button type="link" onClick={showModals} className={styles.button}>Receive</Button>
      </Menu.Item>
    </Menu>
  );

  return (
    <div className={styles.wrapper}>
      <Dropdown
        overlay={menu}
        placement="bottomCenter"
        trigger={['click']}
        overlayClassName={styles.dropdown}
      >
        <Button className={styles.button}>
          {balance}
          {' '}
          SC3
        </Button>
      </Dropdown>
      <Send
        current={balance}
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
