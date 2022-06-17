import { MODAL } from '@libs/constants';
import { useAddButton } from '@libs/hooks/container/wallet';
import useUserAsync from '@libs/hooks/thunk/useEntitiesAction';
import {
  Button, Menu, Dropdown
} from 'antd';
import { useCallback } from 'react';
import styles from './add.module.scss';
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
    { title: 'Add new organization '},
    { title: 'Add new project to organization'},
    { title: 'Add new user'},
    { title: 'Add new project for user'}
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
            <Button type="link" onClick={onClick} className={styles.button}>{title}</Button>
          </Menu.Item>
        );
      })}
    </Menu>
  );

  return (
    <div className={styles.dropdown}>
      <ModalView />
      <div className={styles.wrapper}>
        <Dropdown
          overlay={menu}
          placement="bottomCenter"
          trigger={['click']}
          overlayClassName={styles.dropdown}
        >
          <Button className={styles.addButton}>
            Add
          </Button>
        </Dropdown>
      </div>
    </div>
  );
}

export default AddButton;
