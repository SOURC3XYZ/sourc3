import { NavButton } from '@components/shared';
import { thunks } from '@libs/action-creators';
import { useObjectState } from '@libs/hooks';
import { AppThunkDispatch, RootState } from '@libs/redux';
import { Input } from 'antd';
import Modal from 'antd/lib/modal/Modal';
import Text from 'antd/lib/typography/Text';
import { connect } from 'react-redux';
import styles from './repos-empty.module.css';

type EmptyPropsType = {
  createRepos: (repo_name:string) => void,
};

const initialState = {
  isLoading: true,
  isModalVisible: false,
  inputRepoName: ''
};
const ReposEmpty = ({ createRepos }:EmptyPropsType) => {
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
  return (
    <>
      <div className={styles.wrapper}>
        <Text className={styles.title}>
          You don’t have any repositories, let’s create some
        </Text>
        <NavButton
          type="primary"
          name="Create repository"
          onClick={showModal}
        />
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

export default connect(mapState, mapDispatch)(ReposEmpty);
