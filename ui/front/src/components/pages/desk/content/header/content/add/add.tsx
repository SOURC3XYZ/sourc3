import { PlusOutlined } from '@ant-design/icons';
import { thunks } from '@libs/action-creators';
import { useObjectState } from '@libs/hooks';
import { AppThunkDispatch, RootState } from '@libs/redux';
import {
  Button, Menu, Dropdown, Input
} from 'antd';
import Modal from 'antd/lib/modal/Modal';
import { connect } from 'react-redux';
import styles from './add.module.css';

type AddButtonPropsType = {
  createRepos: (repo_name:string) => void,
};
const initialState = {
  isLoading: true,
  isModalVisible: false,
  inputRepoName: ''
};

const AddButton = ({ createRepos }:AddButtonPropsType) => {
  const [state, setState] = useObjectState<typeof initialState>(initialState);
  const { isModalVisible, inputRepoName } = state;

  const showModal = () => {
    setState({ isModalVisible: true });
  };

  const handleOk = () => {
    setState({ isModalVisible: false });
    createRepos(inputRepoName);
  };

  const handleCancel = () => {
    setState({ isModalVisible: false });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState({ inputRepoName: e.target.value });
  };

  const menu = (
    <Menu>
      <Menu.Item>
        <Button type="link">Clone repository</Button>
      </Menu.Item>
      <Menu.Item>
        <Button type="link" onClick={showModal}>Create new Repository</Button>
      </Menu.Item>
      <Menu.Item>
        <Button type="link">Add existing repository</Button>
      </Menu.Item>
    </Menu>
  );

  return (
    <>
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
            Add
            {' '}
            <PlusOutlined />
          </Button>
        </Dropdown>
        {/* <Send
        current={current}
        isVisible={isVisible}
        onClose={closeModal}
      /> */}
      </div>
      <Modal
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        closable={false}
      >
        <Input
          placeholder="Enter name repository"
          value={inputRepoName}
          onChange={handleChange}
          onPressEnter={handleOk}
        />
      </Modal>

    </>
  );
};

const mapState = ({
  app: { isApiConnected }
}: RootState) => ({
  isApiConnected
});
const mapDispatch = (dispatch: AppThunkDispatch) => ({
  createRepos: (repo_name:string) => {
    if (repo_name === null) return;
    dispatch(thunks.createRepos(repo_name));
  }
});

export default connect(mapState, mapDispatch)(AddButton);
