import { AllRepos, NavButton } from '@components/shared';
import { thunks } from '@libs/action-creators';
import { useObjectState } from '@libs/hooks/shared';
import { AppThunkDispatch, RootState } from '@libs/redux';
import { RepoListType, RepoType } from '@types';
import { Input } from 'antd';
import Modal from 'antd/lib/modal/Modal';
import Text from 'antd/lib/typography/Text';
import { connect } from 'react-redux';
import styles from './repositories.module.css';

type EmptyPropsType = {
  createRepos: (repo_name:string) => void,
  repos: RepoType[]
};

const initialState = {
  isLoading: true,
  isModalVisible: false,
  inputRepoName: ''
};
function Repositories({
  createRepos, repos
}:EmptyPropsType) {
  const [state, setState] = useObjectState(initialState);
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
        {repos.length ? (
          <AllRepos />
        ) : (
          <div className={styles.empty}>
            <Text className={styles.title}>
              You don’t have any repositories, let’s create some
            </Text>
            <NavButton
              type="primary"
              name="Create repository"
              onClick={showModal}
            />
          </div>
        )}
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
}
const mapState = ({
  app: { isApiConnected }, repos: { repos }
}: RootState) => ({
  isApiConnected,
  repos
});

const mapDispatch = (dispatch: AppThunkDispatch) => ({
  createRepos: (repo_name:string) => {
    if (repo_name === null) return;
    dispatch(thunks.createRepos(repo_name));
  },
  getAllRepos: (type: RepoListType) => (resolve: () => void) => {
    dispatch(thunks.getAllRepos(type, resolve));
  }
});

export default connect(mapState, mapDispatch)(Repositories);
