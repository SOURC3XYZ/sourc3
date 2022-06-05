import { PlusOutlined } from '@ant-design/icons';
import { MODAL } from '@libs/constants';
import { useAddButton } from '@libs/hooks/container/wallet';
import useUserAsync from '@libs/hooks/thunk/useEntitiesAction';
import {
  Button, Menu, Dropdown
} from 'antd';
import { useCallback } from 'react';
import styles from './add.module.css';
import { CloneModal } from './content';
import { CreateModal } from './content/create-modal';

function AddButton() {
  const { createRepo } = useUserAsync();
  const {
    modal,
    showModal,
    handleCancel,
    handleOk,
    cloneRepo
  } = useAddButton();

  const data = [
    { title: 'Clone repository', mode: MODAL.CLONE },
    { title: 'Create new Repository', mode: MODAL.CREATE },
    { title: 'Add existing repository', mode: MODAL.ADD }
  ];

  const ModalView = useCallback(():JSX.Element | null => {
    switch (modal) {
      case MODAL.CLONE:
        return (
          <CloneModal
            handleOk={handleOk}
            handleCancel={handleCancel}
            cloneRepo={cloneRepo}
          />
        );
      case MODAL.CREATE:
        return (
          <CreateModal
            handleOk={handleOk}
            handleCancel={handleCancel}
            createRepo={createRepo}
          />
        );
      default:
        return null;
    }
  }, [modal]);

  const menu = (
    <Menu>
      {data.map(({ title, mode }) => {
        const onClick = () => showModal(mode);
        return (
          <Menu.Item key={`menu-item-${title}`}>
            <Button type="link" onClick={onClick}>{title}</Button>
          </Menu.Item>
        );
      })}
    </Menu>
  );

  return (
    <>
      <ModalView />
      <div className={styles.wrapper}>
        <Dropdown overlay={menu} placement="bottomCenter" trigger={['click']}>
          <Button className={styles.addButton}>
            Add
            <PlusOutlined />
          </Button>
        </Dropdown>
      </div>
    </>
  );
}

export default AddButton;
