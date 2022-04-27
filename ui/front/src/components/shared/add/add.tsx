import { PlusOutlined } from '@ant-design/icons';
import { thunks } from '@libs/action-creators';
import { useObjectState } from '@libs/hooks/shared';
import { AppThunkDispatch, RootState } from '@libs/redux';
import {
  Button, Menu, Dropdown
} from 'antd';
import { useCallback } from 'react';
import { connect } from 'react-redux';
import styles from './add.module.css';
import { CloneModal } from './content';
import { CreateModal } from './content/create-modal';

type AddButtonPropsType = {
  createRepo: (repo_name:string) => void,
  cloneRepo: (local:string, remote:string) => void
};

enum MODAL { NONE, CLONE, CREATE, ADD }

const initialState = {
  isLoading: true,
  modal: MODAL.NONE
};

function AddButton({ createRepo, cloneRepo }:AddButtonPropsType) {
  const [state, setState] = useObjectState(initialState);
  const { modal } = state;

  const showModal = (mode: MODAL) => setState({ modal: mode });

  const handleCancel = () => setState({ modal: MODAL.NONE });

  const handleOk = () => {
    setState({ modal: MODAL.NONE });
  };

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
          <Menu.Item>
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

const mapState = ({
  app: { isApiConnected }
}: RootState) => ({
  isApiConnected
});
const mapDispatch = (dispatch: AppThunkDispatch) => ({
  createRepo: (repo_name:string) => {
    if (repo_name === null) return;
    dispatch(thunks.createRepos(repo_name));
  },

  cloneRepo: (local:string, remote: string) => {
    dispatch(thunks.cloneRepo(local, remote));
  }
});

export default connect(mapState, mapDispatch)(AddButton);
